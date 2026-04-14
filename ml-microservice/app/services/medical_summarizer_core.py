"""
Medical Record Summarizer Core
Ported from github.com/abhinavkumar2369/Medical-Summarizer

Provides:
  - Extractive summarization with clinical sentence scoring
  - Structured section parsing (Chief Complaint, HPI, Medications, Labs, etc.)
  - Highlights extraction by clinical category
  - Patient info extraction (Name, DOB, MRN, Age, Sex, etc.)
  - Red-flag / clinical alert detection
  - File readers for .txt, .pdf, .docx, .json
  - Optional AI summarization via BART (facebook/bart-large-cnn)
"""

import json
import re
from collections import Counter
from dataclasses import dataclass, field, asdict
from pathlib import Path
from typing import Dict, List, Optional, Tuple

import logging

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Optional heavy deps — graceful fallback when not installed
# ---------------------------------------------------------------------------

try:
    from pypdf import PdfReader
    _PYPDF_OK = True
except ImportError:
    try:
        from PyPDF2 import PdfReader
        _PYPDF_OK = True
    except ImportError:
        _PYPDF_OK = False

try:
    from docx import Document as DocxDocument
    _DOCX_OK = True
except ImportError:
    _DOCX_OK = False

try:
    from transformers import pipeline as hf_pipeline
    _TRANSFORMERS_OK = True
except ImportError:
    _TRANSFORMERS_OK = False

# ---------------------------------------------------------------------------
# BART model (facebook/bart-large-cnn)
# ---------------------------------------------------------------------------

MODEL_ID = "facebook/bart-large-cnn"
_CHUNK_WORDS = 700  # keep each chunk comfortably under BART's 1 024-token limit

_bart_pipeline = None  # lazily loaded


def get_bart_pipeline():
    """Load BART CNN+Transformer once and cache it."""
    global _bart_pipeline
    if _bart_pipeline is not None:
        return _bart_pipeline
    if not _TRANSFORMERS_OK:
        raise RuntimeError(
            "transformers is not installed. Run: pip install transformers torch"
        )
    logger.info(f"Loading BART model: {MODEL_ID} (first load may take a while)")
    _bart_pipeline = hf_pipeline("summarization", model=MODEL_ID, device=-1)
    return _bart_pipeline


def _chunk_text(text: str, chunk_words: int = _CHUNK_WORDS) -> List[str]:
    words = text.split()
    return [
        " ".join(words[i: i + chunk_words])
        for i in range(0, len(words), chunk_words)
    ]


def ai_summary(text: str, pipe, max_len: int = 180, min_len: int = 55) -> str:
    """Abstractive summary via the BART CNN+Transformer pipeline with chunking."""
    cleaned = clean_text(text)
    chunks = [c for c in _chunk_text(cleaned) if len(c.strip()) > 80]
    if not chunks:
        return "No readable clinical text found."

    chunk_summaries: List[str] = []
    for chunk in chunks:
        out = pipe(chunk, max_length=max_len, min_length=min_len, do_sample=False)
        chunk_summaries.append(out[0]["summary_text"])

    combined = " ".join(chunk_summaries)

    # Second-pass consolidation when multiple chunks were summarised
    if len(chunks) > 1 and len(combined.split()) > min_len:
        final = pipe(
            combined,
            max_length=max_len + 60,
            min_length=min_len,
            do_sample=False,
        )
        return final[0]["summary_text"]

    return combined


# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

STOPWORDS = {
    "a", "an", "the", "and", "or", "but", "if", "then", "else", "when", "while",
    "to", "from", "for", "of", "on", "in", "at", "by", "with", "without", "as",
    "is", "are", "was", "were", "be", "been", "being", "do", "does", "did", "can",
    "could", "should", "would", "will", "may", "might", "must", "this", "that", "these",
    "those", "it", "its", "he", "she", "they", "them", "his", "her", "their", "we",
    "our", "you", "your", "i", "me", "my", "mine", "not", "no", "yes", "also",
    "patient", "pt", "mrn", "name", "date", "hospital", "clinic",
}

# Sentences containing these get a score boost — they carry clinical facts
CLINICAL_BOOST_RE = re.compile(
    r"\b(\d+\.?\d*\s*(?:mg|mcg|mmol|g|kg|L|mL|%|bpm|mmHg|units?)|"
    r"diagnosed|presented|prescribed|admitted|discharged|treated|elevated|decreased|"
    r"abnormal|positive|negative|acute|chronic|bilateral|unilateral|reported|ordered)\b",
    re.IGNORECASE,
)

# (regex, canonical section name) — order matters; first match wins
_SECTION_LABEL_MAP: List[Tuple[str, str]] = [
    (r"^(chief\s*complaint|cc)\s*[:\-]?\s*$", "Chief Complaint"),
    (r"^(hpi|history\s+of\s+present\s+illness)\s*[:\-]?\s*$", "History of Present Illness"),
    (r"^(past\s+(medical\s+)?history|pmh)\s*[:\-]?\s*$", "Past Medical History"),
    (r"^(social\s+history)\s*[:\-]?\s*$", "Social History"),
    (r"^(family\s+history)\s*[:\-]?\s*$", "Family History"),
    (r"^(review\s+of\s+systems|ros)\s*[:\-]?\s*$", "Review of Systems"),
    (r"^(diagnos(is|es)|assessment|problem\s+list|impression|final\s+diagnosis)\s*[:\-]?\s*$", "Diagnoses / Assessment"),
    (r"^(medication|medications|current\s+medications|home\s+medications|rx)\s*[:\-]?\s*$", "Medications"),
    (r"^(allerg(y|ies)|nka|nkda)\s*[:\-]?\s*$", "Allergies"),
    (r"^(lab(s|oratory)?|blood\s+work|lab\s+results|results)\s*[:\-]?\s*$", "Labs / Results"),
    (r"^(procedure|procedures|surgery|operative\s+note|intervention|imaging)\s*[:\-]?\s*$", "Procedures / Imaging"),
    (r"^(vital\s+signs?|vitals?)\s*[:\-]?\s*$", "Vitals"),
    (r"^(physical\s+exam(ination)?|pe)\s*[:\-]?\s*$", "Physical Exam"),
    (r"^(plan|treatment(\s+plan)?|follow.?up|recommendation|disposition|discharge\s+summary)\s*[:\-]?\s*$", "Plan / Disposition"),
]

HIGHLIGHT_PATTERNS: Dict[str, str] = {
    "Diagnoses":  r"\b(diagnosis|diagnoses|assessment|problem\s+list|impression|dx\b)\b",
    "Medications": r"\b(medication|medications|rx\b|prescribed|dose|dosage|mg\b|mcg\b|tablet|capsule)\b",
    "Allergies":  r"\b(allergy|allergies|nka|nkda|allergic)\b",
    "Labs":       r"\b(cbc|cmp|a1c|creatinine|hemoglobin|troponin|glucose|sodium|potassium|wbc|rbc|platelet|bun|gfr|inr)\b",
    "Vitals":     r"\b(bp\b|blood\s+pressure|heart\s+rate|pulse|temperature|respiratory\s+rate|spo2|o2\s+sat|bmi)\b",
    "Procedures": r"\b(procedure|surgery|mri\b|ct\b|x-ray|xray|ultrasound|ecg\b|ekg\b|biopsy|catheter)\b",
    "Plan":       r"\b(plan\b|follow.?up|discharge|refer|consult|recommend)\b",
}

# (regex, display description, severity: "error"|"warning")
RED_FLAG_PATTERNS: List[Tuple[str, str, str]] = [
    (r"\b(critical|critically\s+ill)\b",             "Critical condition mentioned",          "error"),
    (r"\b(emergency|emergent|urgent)\b",              "Urgent / emergency term found",          "warning"),
    (r"\b(sepsis|septic\s+shock)\b",                  "Sepsis detected",                        "error"),
    (r"\b(myocardial\s+infarction|heart\s+attack)\b", "Possible MI / cardiac event",            "error"),
    (r"\b(stroke|cva\b|tia\b)\b",                     "Possible stroke / CVA / TIA",            "error"),
    (r"\b(pulmonary\s+embolism)\b",                   "Possible pulmonary embolism",            "error"),
    (r"\b(respiratory\s+failure|intubat\w+|ventilat\w+)\b", "Respiratory failure / intubation", "error"),
    (r"\b(hemorrhage|haemorrhage)\b",                 "Hemorrhage noted",                       "error"),
    (r"\b(dnr\b|do\s+not\s+resuscitate|comfort\s+care)\b", "DNR / comfort care order present", "warning"),
    (r"\b(anaphylaxis|anaphylactic)\b",               "Anaphylaxis risk",                       "error"),
    (r"\b(malignancy|carcinoma|metastatic|cancer\b)\b", "Malignancy mentioned",                 "warning"),
    (r"\b(suicidal|self.harm|overdose)\b",            "Mental health / safety alert",           "error"),
]

PATIENT_INFO_PATTERNS: Dict[str, str] = {
    "Name":               r"(?:patient(?:\s+name)?|name)\s*[:\-]\s*([A-Z][a-zA-Z\-]+(?:\s+[A-Z][a-zA-Z\-]+){1,3})",
    "Date of Birth":      r"(?:dob|date\s+of\s+birth|birth\s*date)\s*[:\-]\s*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})",
    "MRN":                r"(?:mrn|medical\s+record(?:\s+number)?)\s*[:\-#]\s*([A-Z0-9\-]{4,20})",
    "Age":                r"\baged?\s*[:\-]?\s*(\d{1,3})\s*(?:years?|y\/o|yo)?\b",
    "Sex":                r"\b(?:sex|gender)\s*[:\-]\s*(male|female|other|non.binary)",
    "Admission Date":     r"(?:admission|admit(?:ted)?)\s*(?:date)?\s*[:\-]\s*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})",
    "Attending Physician": r"(?:attending|physician)\s*[:\-]\s*(?:Dr\.?\s+)?([A-Z][a-zA-Z\-]+(?:\s+[A-Z][a-zA-Z\-]+){0,2})",
}

# ---------------------------------------------------------------------------
# Data structure
# ---------------------------------------------------------------------------

@dataclass
class SummaryResult:
    summary: str
    highlights: Dict[str, List[str]] = field(default_factory=dict)
    patient_info: Dict[str, str] = field(default_factory=dict)
    red_flags: List[Dict[str, str]] = field(default_factory=list)   # [{description, severity}]
    sections: Dict[str, str] = field(default_factory=dict)           # section_name -> raw block
    word_count: int = 0
    sentence_count: int = 0

    def to_dict(self) -> dict:
        return asdict(self)


# ---------------------------------------------------------------------------
# File readers
# ---------------------------------------------------------------------------

def read_txt(path: Path) -> str:
    return path.read_text(encoding="utf-8", errors="ignore")


def read_pdf_file(path: Path) -> str:
    if not _PYPDF_OK:
        raise RuntimeError("pypdf / PyPDF2 not installed. Run: pip install pypdf")
    reader = PdfReader(str(path))
    return "\n".join(page.extract_text() or "" for page in reader.pages)


def read_docx_file(path: Path) -> str:
    if not _DOCX_OK:
        raise RuntimeError("python-docx not installed. Run: pip install python-docx")
    doc = DocxDocument(str(path))
    return "\n".join(p.text for p in doc.paragraphs)


def read_json_file(path: Path) -> str:
    data = json.loads(path.read_text(encoding="utf-8", errors="ignore"))
    return json.dumps(data, indent=2)


def read_record(path: Path) -> str:
    ext = path.suffix.lower()
    readers = {
        ".txt": read_txt,
        ".pdf": read_pdf_file,
        ".docx": read_docx_file,
        ".json": read_json_file,
    }
    if ext not in readers:
        raise ValueError(f"Unsupported file type: {ext}. Supported: .txt, .pdf, .docx, .json")
    return readers[ext](path)


def read_pdf_bytes(pdf_bytes: bytes) -> str:
    """Extract text from PDF bytes."""
    if not _PYPDF_OK:
        raise RuntimeError("pypdf not installed. Run: pip install pypdf")
    import io
    reader = PdfReader(io.BytesIO(pdf_bytes))
    return "\n".join(page.extract_text() or "" for page in reader.pages)


# ---------------------------------------------------------------------------
# Text helpers
# ---------------------------------------------------------------------------

def clean_text(text: str) -> str:
    text = re.sub(r"\r\n?", "\n", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    text = re.sub(r"[ \t]{2,}", " ", text)
    return text.strip()


def split_sentences(text: str) -> List[str]:
    parts = re.split(r"(?<=[.!?])\s+", text)
    return [p.strip() for p in parts if len(p.strip()) > 20]


def tokenize(text: str) -> List[str]:
    return re.findall(r"[a-zA-Z][a-zA-Z0-9\-]{1,}", text.lower())


# ---------------------------------------------------------------------------
# Structured section parsing
# ---------------------------------------------------------------------------

def _match_section_name(line: str) -> Optional[str]:
    for pattern, name in _SECTION_LABEL_MAP:
        if re.match(pattern, line.strip(), re.IGNORECASE):
            return name
    return None


def parse_sections(text: str) -> Dict[str, str]:
    """Split document into named clinical sections using header detection."""
    lines = clean_text(text).split("\n")
    sections: Dict[str, List[str]] = {}
    current = "General"
    buffer: List[str] = []

    for line in lines:
        stripped = line.strip()
        if not stripped:
            continue
        name = _match_section_name(stripped)
        if name:
            if buffer:
                sections.setdefault(current, []).extend(buffer)
            current = name
            buffer = []
        else:
            buffer.append(stripped)

    if buffer:
        sections.setdefault(current, []).extend(buffer)

    return {k: "\n".join(v).strip() for k, v in sections.items() if v}


# ---------------------------------------------------------------------------
# Summarization (extractive)
# ---------------------------------------------------------------------------

def score_sentences(sentences: List[str]) -> Dict[int, float]:
    tokens = tokenize(" ".join(sentences))
    freq = Counter(t for t in tokens if t not in STOPWORDS)
    if not freq:
        return {i: 0.0 for i in range(len(sentences))}

    max_freq = max(freq.values())
    norm = {w: c / max_freq for w, c in freq.items()}

    scores: Dict[int, float] = {}
    for i, sentence in enumerate(sentences):
        words = tokenize(sentence)
        content = [w for w in words if w not in STOPWORDS]
        if not content:
            scores[i] = 0.0
            continue
        score = sum(norm.get(w, 0.0) for w in content) / len(content)
        if CLINICAL_BOOST_RE.search(sentence):   # boost clinically informative sentences
            score *= 1.4
        if len(sentence) < 40:                   # penalise fragments / headers
            score *= 0.7
        scores[i] = score
    return scores


def extractive_summary(text: str, max_sentences: int = 8) -> Tuple[str, int]:
    """Return (summary_text, total_sentence_count)."""
    sentences = split_sentences(clean_text(text))
    if not sentences:
        return "No readable clinical text found.", 0
    if len(sentences) <= max_sentences:
        return " ".join(sentences), len(sentences)
    scores = score_sentences(sentences)
    ranked = sorted(scores.items(), key=lambda x: x[1], reverse=True)[:max_sentences]
    selected = sorted(i for i, _ in ranked)
    return " ".join(sentences[i] for i in selected), len(sentences)


# ---------------------------------------------------------------------------
# Highlights
# ---------------------------------------------------------------------------

def extract_highlights(
    text: str,
    sections: Dict[str, str],
    max_per_section: int = 6,
) -> Dict[str, List[str]]:
    """Use parsed section content when available; fall back to pattern scan."""
    highlights: Dict[str, List[str]] = {}

    _section_alias = {
        "Diagnoses":  ["Diagnoses / Assessment"],
        "Medications": ["Medications"],
        "Allergies":  ["Allergies"],
        "Labs":       ["Labs / Results"],
        "Vitals":     ["Vitals"],
        "Procedures": ["Procedures / Imaging"],
        "Plan":       ["Plan / Disposition"],
    }

    for key, aliases in _section_alias.items():
        for alias in aliases:
            if alias in sections:
                lines = [l.strip() for l in sections[alias].split("\n") if l.strip()]
                if lines:
                    highlights[key] = lines[:max_per_section]
                break

    all_lines = [l.strip() for l in clean_text(text).split("\n") if l.strip()]
    for key, pattern in HIGHLIGHT_PATTERNS.items():
        if key in highlights:
            continue
        matched = [l for l in all_lines if re.search(pattern, l, re.IGNORECASE)]
        if matched:
            highlights[key] = matched[:max_per_section]

    return highlights


# ---------------------------------------------------------------------------
# Patient info & red flags
# ---------------------------------------------------------------------------

def extract_patient_info(text: str) -> Dict[str, str]:
    info: Dict[str, str] = {}
    for field_name, pattern in PATIENT_INFO_PATTERNS.items():
        match = re.search(pattern, text, re.IGNORECASE | re.MULTILINE)
        if match:
            info[field_name] = match.group(1).strip()
    return info


def detect_red_flags(text: str) -> List[Dict[str, str]]:
    """Return list of {description, severity} dicts for clinical red flags found."""
    found: List[Dict[str, str]] = []
    seen: set = set()
    for pattern, description, severity in RED_FLAG_PATTERNS:
        if re.search(pattern, text, re.IGNORECASE) and description not in seen:
            found.append({"description": description, "severity": severity})
            seen.add(description)
    return found


# ---------------------------------------------------------------------------
# Main entry point
# ---------------------------------------------------------------------------

def summarize_medical_record(
    raw_text: str,
    max_sentences: int = 8,
    use_bart: bool = False,
) -> SummaryResult:
    """
    Analyse raw medical record text and return a SummaryResult.

    Parameters
    ----------
    raw_text      : The full text of the medical record.
    max_sentences : Max sentences for extractive mode.
    use_bart      : If True, attempt to load and use BART (heavy, ~1.6 GB).
                    Falls back to extractive on failure.
    """
    cleaned = clean_text(raw_text)
    sections = parse_sections(cleaned)

    pipe = None
    if use_bart:
        try:
            pipe = get_bart_pipeline()
        except Exception as e:
            logger.warning(f"BART not available, using extractive fallback: {e}")

    if pipe is not None:
        summary = ai_summary(cleaned, pipe)
        sentence_count = len(split_sentences(cleaned))
    else:
        summary, sentence_count = extractive_summary(cleaned, max_sentences=max_sentences)

    highlights = extract_highlights(cleaned, sections)
    patient_info = extract_patient_info(cleaned)
    red_flags = detect_red_flags(cleaned)
    word_count = len(tokenize(cleaned))

    return SummaryResult(
        summary=summary,
        highlights=highlights,
        patient_info=patient_info,
        red_flags=red_flags,
        sections=sections,
        word_count=word_count,
        sentence_count=sentence_count,
    )
