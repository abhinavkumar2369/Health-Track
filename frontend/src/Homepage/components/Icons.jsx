// Icon components for the homepage using Lucide React
import { 
    Building2, 
    Stethoscope, 
    Heart, 
    Activity, 
    Shield, 
    TrendingUp 
} from 'lucide-react';

export const HospitalIcon = () => (
    <Building2 className="w-8 h-8 text-white" strokeWidth={2.5} />
);

export const DoctorIcon = () => (
    <Stethoscope className="w-8 h-8 text-white" strokeWidth={2.5} />
);

export const PatientIcon = () => (
    <Heart className="w-8 h-8 text-white" strokeWidth={2.5} fill="white" />
);

export const StethoscopeIcon = () => (
    <Stethoscope className="w-full h-full" strokeWidth={2} />
);

export const HeartMonitorIcon = () => (
    <Activity className="w-full h-full" strokeWidth={2} />
);

export const SecurityIcon = () => (
    <Shield className="w-full h-full" strokeWidth={2} />
);

export const ChartIcon = () => (
    <TrendingUp className="w-full h-full" strokeWidth={2} />
);
