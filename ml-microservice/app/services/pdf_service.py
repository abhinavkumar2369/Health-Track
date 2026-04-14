"""
PDF Service — Text Extraction & Combined Report Generation
Uses pdfplumber for extraction and reportlab for PDF generation.
"""

import logging
import io
from typing import List, Dict, Any, Optional
from datetime import datetime

logger = logging.getLogger(__name__)


class PDFService:
    """
    Service for PDF text extraction and combined medical report PDF generation.
    """

    def __init__(self):
        logger.info("PDFService initialized")

    def extract_text_from_pdf(self, pdf_bytes: bytes) -> Dict[str, Any]:
        """
        Extract text from a PDF document using pdfplumber.

        Args:
            pdf_bytes: Raw PDF file bytes

        Returns:
            Dictionary with extracted_text, page_count, and pages data
        """
        try:
            import pdfplumber

            pages_data = []
            full_text = ""

            with pdfplumber.open(io.BytesIO(pdf_bytes)) as pdf:
                for i, page in enumerate(pdf.pages):
                    page_text = page.extract_text() or ""
                    pages_data.append(
                        {
                            "page_number": i + 1,
                            "text": page_text,
                            "width": page.width,
                            "height": page.height,
                        }
                    )
                    full_text += page_text + "\n\n"

            return {
                "extracted_text": full_text.strip(),
                "page_count": len(pages_data),
                "pages": pages_data,
                "method": "pdfplumber",
                "success": True,
            }

        except Exception as e:
            logger.error(f"PDF text extraction error: {e}")
            return {
                "extracted_text": "",
                "page_count": 0,
                "pages": [],
                "method": "pdfplumber_error",
                "success": False,
                "error": str(e),
            }

    def generate_combined_report(
        self,
        patient_info: Dict[str, Any],
        summaries: List[Dict[str, Any]],
        overall_summary: Optional[str] = None,
    ) -> bytes:
        """
        Generate a professional combined PDF report from all medical record summaries.

        Args:
            patient_info: Patient details (name, id, etc.)
            summaries: List of document summaries
            overall_summary: Optional overall health summary

        Returns:
            PDF file as bytes
        """
        try:
            from reportlab.lib.pagesizes import A4
            from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
            from reportlab.lib.units import inch, mm
            from reportlab.lib.colors import HexColor
            from reportlab.platypus import (
                SimpleDocTemplate,
                Paragraph,
                Spacer,
                Table,
                TableStyle,
                PageBreak,
                HRFlowable,
            )
            from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_JUSTIFY

            buffer = io.BytesIO()
            doc = SimpleDocTemplate(
                buffer,
                pagesize=A4,
                rightMargin=25 * mm,
                leftMargin=25 * mm,
                topMargin=30 * mm,
                bottomMargin=25 * mm,
            )

            styles = getSampleStyleSheet()
            elements = []

            # Custom styles
            title_style = ParagraphStyle(
                "CustomTitle",
                parent=styles["Title"],
                fontSize=24,
                textColor=HexColor("#1e40af"),
                spaceAfter=6,
                fontName="Helvetica-Bold",
            )

            subtitle_style = ParagraphStyle(
                "SubTitle",
                parent=styles["Normal"],
                fontSize=11,
                textColor=HexColor("#6b7280"),
                spaceAfter=20,
                alignment=TA_CENTER,
            )

            heading_style = ParagraphStyle(
                "SectionHeading",
                parent=styles["Heading2"],
                fontSize=14,
                textColor=HexColor("#1e3a5f"),
                spaceBefore=16,
                spaceAfter=8,
                fontName="Helvetica-Bold",
            )

            subheading_style = ParagraphStyle(
                "SubHeading",
                parent=styles["Heading3"],
                fontSize=11,
                textColor=HexColor("#374151"),
                spaceBefore=10,
                spaceAfter=4,
                fontName="Helvetica-Bold",
            )

            body_style = ParagraphStyle(
                "BodyText",
                parent=styles["Normal"],
                fontSize=10,
                textColor=HexColor("#374151"),
                spaceAfter=6,
                leading=14,
                alignment=TA_JUSTIFY,
            )

            badge_style = ParagraphStyle(
                "Badge",
                parent=styles["Normal"],
                fontSize=9,
                textColor=HexColor("#ffffff"),
            )

            footer_style = ParagraphStyle(
                "Footer",
                parent=styles["Normal"],
                fontSize=8,
                textColor=HexColor("#9ca3af"),
                alignment=TA_CENTER,
            )

            # ==== HEADER ====
            elements.append(Paragraph("🏥 Health Track", title_style))
            elements.append(
                Paragraph("AI-Powered Medical Records Summary Report", subtitle_style)
            )
            elements.append(
                HRFlowable(
                    width="100%",
                    thickness=2,
                    color=HexColor("#3b82f6"),
                    spaceAfter=15,
                )
            )

            # ==== PATIENT INFO ====
            elements.append(Paragraph("Patient Information", heading_style))

            patient_name = patient_info.get("name", "N/A")
            patient_id = patient_info.get("id", "N/A")
            generated_at = datetime.utcnow().strftime("%B %d, %Y at %I:%M %p UTC")

            info_data = [
                ["Patient Name:", patient_name, "Patient ID:", str(patient_id)[:12]],
                [
                    "Report Date:",
                    generated_at,
                    "Total Records:",
                    str(len(summaries)),
                ],
            ]

            info_table = Table(info_data, colWidths=[90, 170, 90, 170])
            info_table.setStyle(
                TableStyle(
                    [
                        ("BACKGROUND", (0, 0), (-1, -1), HexColor("#f0f7ff")),
                        ("TEXTCOLOR", (0, 0), (0, -1), HexColor("#1e40af")),
                        ("TEXTCOLOR", (2, 0), (2, -1), HexColor("#1e40af")),
                        ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"),
                        ("FONTNAME", (2, 0), (2, -1), "Helvetica-Bold"),
                        ("FONTSIZE", (0, 0), (-1, -1), 10),
                        ("PADDING", (0, 0), (-1, -1), 8),
                        ("GRID", (0, 0), (-1, -1), 0.5, HexColor("#dbeafe")),
                        ("ROUNDEDCORNERS", [4, 4, 4, 4]),
                    ]
                )
            )
            elements.append(info_table)
            elements.append(Spacer(1, 15))

            # ==== OVERALL SUMMARY ====
            if overall_summary:
                elements.append(Paragraph("Overall Health Summary", heading_style))
                elements.append(
                    HRFlowable(
                        width="100%",
                        thickness=1,
                        color=HexColor("#e5e7eb"),
                        spaceAfter=8,
                    )
                )
                elements.append(Paragraph(overall_summary, body_style))
                elements.append(Spacer(1, 10))

            # ==== URGENCY OVERVIEW ====
            urgency_counts = {"high": 0, "moderate": 0, "low": 0}
            for s in summaries:
                level = s.get("urgency_level", "low").lower()
                if level in urgency_counts:
                    urgency_counts[level] += 1

            if any(v > 0 for v in urgency_counts.values()):
                elements.append(Paragraph("Urgency Overview", heading_style))
                urgency_data = [
                    ["🔴 High", "🟡 Moderate", "🟢 Low"],
                    [
                        str(urgency_counts["high"]),
                        str(urgency_counts["moderate"]),
                        str(urgency_counts["low"]),
                    ],
                ]
                urgency_table = Table(urgency_data, colWidths=[173, 173, 173])
                urgency_table.setStyle(
                    TableStyle(
                        [
                            ("ALIGN", (0, 0), (-1, -1), "CENTER"),
                            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                            ("FONTSIZE", (0, 0), (-1, 0), 11),
                            ("FONTSIZE", (0, 1), (-1, 1), 18),
                            ("PADDING", (0, 0), (-1, -1), 10),
                            ("BACKGROUND", (0, 0), (0, -1), HexColor("#fef2f2")),
                            ("BACKGROUND", (1, 0), (1, -1), HexColor("#fffbeb")),
                            ("BACKGROUND", (2, 0), (2, -1), HexColor("#f0fdf4")),
                            ("GRID", (0, 0), (-1, -1), 0.5, HexColor("#e5e7eb")),
                        ]
                    )
                )
                elements.append(urgency_table)
                elements.append(Spacer(1, 15))

            # ==== INDIVIDUAL DOCUMENT SUMMARIES ====
            elements.append(
                Paragraph("Individual Document Summaries", heading_style)
            )
            elements.append(
                HRFlowable(
                    width="100%",
                    thickness=1,
                    color=HexColor("#e5e7eb"),
                    spaceAfter=10,
                )
            )

            for idx, summary in enumerate(summaries, 1):
                doc_title = summary.get("document_name", f"Document {idx}")
                doc_type = summary.get("document_type", "other").replace("-", " ").title()
                urgency = summary.get("urgency_level", "low")
                
                urgency_color = {
                    "high": "#dc2626",
                    "moderate": "#d97706",
                    "low": "#16a34a",
                }.get(urgency, "#6b7280")

                # Document header
                elements.append(
                    Paragraph(
                        f'<font color="#1e40af">#{idx}</font> — {doc_title}',
                        subheading_style,
                    )
                )

                # Type and urgency badges
                badge_text = f'<font color="#6b7280">Type: </font><font color="#1e40af"><b>{doc_type}</b></font>'
                badge_text += f'  |  <font color="#6b7280">Urgency: </font><font color="{urgency_color}"><b>{urgency.upper()}</b></font>'

                ocr_method = summary.get("ocr_method", "")
                if ocr_method:
                    badge_text += f'  |  <font color="#6b7280">OCR: </font><font color="#7c3aed"><b>{ocr_method}</b></font>'

                elements.append(
                    Paragraph(
                        badge_text,
                        ParagraphStyle(
                            "BadgeRow",
                            parent=styles["Normal"],
                            fontSize=9,
                            spaceAfter=6,
                        ),
                    )
                )

                # Summary text
                summary_text = summary.get("summary", "No summary available.")
                elements.append(Paragraph(f"<b>Summary:</b> {summary_text}", body_style))

                # Key findings
                findings = summary.get("key_findings", [])
                if findings:
                    elements.append(
                        Paragraph(
                            "<b>Key Findings:</b>",
                            ParagraphStyle(
                                "FindingsLabel",
                                parent=body_style,
                                spaceBefore=4,
                                spaceAfter=2,
                            ),
                        )
                    )
                    for finding in findings[:5]:
                        elements.append(
                            Paragraph(
                                f"  • {finding}",
                                ParagraphStyle(
                                    "Finding",
                                    parent=body_style,
                                    leftIndent=15,
                                    spaceAfter=2,
                                ),
                            )
                        )

                # Recommendations
                recs = summary.get("recommendations", [])
                if recs:
                    elements.append(
                        Paragraph(
                            "<b>Recommendations:</b>",
                            ParagraphStyle(
                                "RecsLabel",
                                parent=body_style,
                                spaceBefore=4,
                                spaceAfter=2,
                            ),
                        )
                    )
                    for rec in recs[:3]:
                        elements.append(
                            Paragraph(
                                f"  → {rec}",
                                ParagraphStyle(
                                    "Rec",
                                    parent=body_style,
                                    leftIndent=15,
                                    spaceAfter=2,
                                    textColor=HexColor("#1e40af"),
                                ),
                            )
                        )

                # Separator between documents
                elements.append(Spacer(1, 8))
                if idx < len(summaries):
                    elements.append(
                        HRFlowable(
                            width="90%",
                            thickness=0.5,
                            color=HexColor("#d1d5db"),
                            spaceAfter=8,
                        )
                    )

            # ==== FOOTER ====
            elements.append(Spacer(1, 30))
            elements.append(
                HRFlowable(
                    width="100%",
                    thickness=1,
                    color=HexColor("#3b82f6"),
                    spaceAfter=8,
                )
            )
            elements.append(
                Paragraph(
                    "This report was generated by Health Track AI Summarization System using CNN + Transformer models.",
                    footer_style,
                )
            )
            elements.append(
                Paragraph(
                    f"Generated on {generated_at}. For professional medical advice, consult your healthcare provider.",
                    footer_style,
                )
            )
            elements.append(
                Paragraph(
                    "⚠️ AI-generated summaries are for reference only and do not replace professional medical diagnosis.",
                    ParagraphStyle(
                        "Disclaimer",
                        parent=footer_style,
                        textColor=HexColor("#ef4444"),
                        spaceBefore=4,
                    ),
                )
            )

            # Build PDF
            doc.build(elements)
            pdf_bytes = buffer.getvalue()
            buffer.close()

            return pdf_bytes

        except Exception as e:
            logger.error(f"PDF generation error: {e}")
            raise


# Singleton instance
pdf_service = PDFService()
