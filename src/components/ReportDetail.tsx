

import { Timestamp } from 'firebase/firestore';

interface Report {
  id: string;
  category: string;
  createdAt: string; 
  formData: any;
}

const formatDate = (dateSource: string | Date | Timestamp) => {
    if (!dateSource || dateSource === 'NILL') return 'N/A';
    
    // Handle time-only strings like "13:50"
    if (typeof dateSource === 'string' && dateSource.match(/^\d{2}:\d{2}$/)) {
        return dateSource;
    }
  
    try {
        const date = (dateSource instanceof Timestamp) ? dateSource.toDate() : new Date(dateSource);
        if (isNaN(date.getTime())) { 
          return 'Data inválida';
        }
        return date.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch {
        return String(dateSource); // Fallback for any other unexpected format
    }
};


const renderValue = (key: string, value: any): React.ReactNode => {
    if (value === null || value === undefined || value === 'NILL' || value === '') return null;
    if (typeof value === 'boolean') return value ? 'Sim' : 'Não';
    
    const dateKeys = ['data', 'dn', 'createdAt', 'updatedAt', 'qtrInicio', 'qtrTermino'];
    if (dateKeys.includes(key) && (typeof value === 'string' || value instanceof Date || value instanceof Timestamp)) {
       return formatDate(value);
    }
    
    if (value instanceof Date) return formatDate(value);
    if (value instanceof Timestamp) return formatDate(value);
     if (value.seconds && typeof value.seconds === 'number') {
        return formatDate(new Timestamp(value.seconds, value.nanoseconds).toDate());
    }

    if (Array.isArray(value)) return value.join(', ').replace(/[-_]/g, ' ').toUpperCase();

    if (typeof value === 'object') {
        return (
            <ul className="list-disc pl-5 space-y-1">
                {Object.entries(value).map(([subKey, val]) => {
                     const renderedVal = renderValue(subKey, val);
                     if (renderedVal === null) return null;
                     return (
                        <li key={subKey}>
                            <span className="font-semibold capitalize">{formatKey(subKey)}:</span> {renderedVal}
                        </li>
                     )
                })}
            </ul>
        );
    }
    
    if (typeof value === 'string') {
        return value.replace(/[-_]/g, ' ').toUpperCase();
    }

    return String(value);
};

const formatKey = (key: string) => {
    return key
        .replace(/([A-Z])/g, ' $1')
        .replace(/_/g, ' ')
        .replace(/\b\w/g, char => char.toUpperCase());
};

export default function ReportDetail({ formData }: { formData: any }) {
    if (!formData) return <p>Sem detalhes para exibir.</p>;

    const renderSection = (title: string, data: any) => {
        if (!data || Object.keys(data).length === 0) return null;
        const filteredData = Object.entries(data).filter(([_, value]) => value !== 'NILL' && value !== '' && (!Array.isArray(value) || value.length > 0));
        if (filteredData.length === 0) return null;

        return (
            <div className="mb-4">
                <h4 className="text-lg font-semibold mb-2 text-primary">{title}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 text-lg">
                    {filteredData.map(([key, value]) => {
                         const renderedVal = renderValue(key, value);
                         if (renderedVal === null) return null;
                         return (
                             <div key={key} className="flex flex-col">
                                <span className="font-bold text-muted-foreground">{formatKey(key)}</span>
                                <span>{renderedVal}</span>
                            </div>
                         )
                    })}
                </div>
            </div>
        );
    };

    const renderVehicleSection = (vehicles: any[]) => {
        if (!vehicles || vehicles.length === 0) return null;
        return (
            <div>
                 {vehicles.map((vehicle, index) => {
                    const filteredVehicleData = Object.entries(vehicle).filter(([key, value]) => key !== 'id' && value !== 'NILL' && value !== '' && (!Array.isArray(value) || value.length > 0));
                    if(filteredVehicleData.length === 0) return null;

                    return (
                        <div key={index} className="mb-6 mt-4 border-t pt-4">
                            <h4 className="text-xl font-semibold mb-2 text-primary">Veículo {index + 1}</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 text-lg">
                                {filteredVehicleData.map(([key, value]) => {
                                    const renderedVal = renderValue(key, value);
                                    if(renderedVal === null) return null;
                                    return (
                                        <div key={key} className="flex flex-col">
                                            <span className="font-bold text-muted-foreground">{formatKey(key)}</span>
                                            <span>{renderedVal}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )
                 })}
            </div>
        )
    };

    return (
        <div className="space-y-4">
            {renderSection("Informações Gerais", formData.generalInfo)}
            {renderVehicleSection(formData.vehicles)}
            {renderSection("Características do Entorno", formData.caracteristicasEntorno)}
            {renderSection("Traçado da Pista", formData.tracadoPista)}
            {renderSection("Sinalização", formData.sinalizacaoInfo)}
            {renderSection("Outras Informações", formData.otherInfo)}
        </div>
    );
};
