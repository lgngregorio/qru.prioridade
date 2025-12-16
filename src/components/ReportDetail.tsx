

import { Timestamp } from 'firebase/firestore';

interface Report {
  id: string;
  category: string;
  createdAt: string; 
  formData: any;
}

const formatDate = (dateSource: string | Date | Timestamp) => {
    if (!dateSource || dateSource === 'NILL') return 'N/A';
    
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

const autoCorrectMap: { [key: string]: string } = {
    'area': 'Área',
    'veiculo': 'Veículo',
    'veiculos': 'Veículos',
    'condicao': 'Condição',
    'sinalizacao': 'Sinalização',
    'tracado': 'Traçado',
    'saida': 'Saída',
    'reboque': 'Reboque',
    'numero': 'Número',
    'ocorrencia': 'Ocorrência',
    'observacoes': 'Observações',
    'informacoes': 'Informações',
    'caracteristicas': 'Características',
    'auxilios': 'Auxílios',
    'vitima': 'Vítima',
    'vitimas': 'Vítimas',
    'operacionais': 'Operacionais',
    'materiais': 'Materiais',
    'destinacao': 'Destinação',
    'responsavel': 'Responsável',
    'frequencia': 'Frequência',
    'inicio': 'Início',
    'termino': 'Término',
};

const autoCorrect = (text: string): string => {
  if (typeof text !== 'string') return text;
  // Use uma expressão regular para encontrar palavras inteiras, ignorando maiúsculas e minúsculas
  const regex = new RegExp(`\\b(${Object.keys(autoCorrectMap).join('|')})\\b`, 'gi');
  return text.replace(regex, (matched) => autoCorrectMap[matched.toLowerCase()] || matched);
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

    if (Array.isArray(value)) return autoCorrect(value.join(', ').replace(/[-_]/g, ' ')).toUpperCase();

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
        const correctedValue = autoCorrect(value);
        return correctedValue.replace(/[-_]/g, ' ').toUpperCase();
    }

    return String(value);
};

const sectionTitles: { [key: string]: string } = {
  generalInfo: 'INFORMAÇÕES GERAIS',
  vehicles: 'VEÍCULOS',
  caracteristicasEntorno: 'CARACTERÍSTICAS DO ENTORNO',
  tracadoPista: 'TRAÇADO DA PISTA',
  sinalizacaoInfo: 'SINALIZAÇÃO',
  otherInfo: 'OUTRAS INFORMAÇÕES',
  previa: 'ACIDENTE PRÉVIA',
  confirmacao: 'CONFIRMAÇÃO DA PRÉVIA',
  condicao: 'CONDIÇÃO',
  pista: 'PISTA',
  sinalizacao: 'SINALIZAÇÃO (GERAL)',
  dadosOperacionais: "DADOS OPERACIONAIS",
  victims: "VÍTIMAS",
  consumoMateriais: "CONSUMO DE MATERIAIS",
  relatorio: "RELATÓRIO/OBSERVAÇÕES",
  observacoes: "OBSERVAÇÕES",
  ocorrencia: "OCORRÊNCIA",
  destinacaoAnimal: 'DESTINAÇÃO DO ANIMAL',
  qthExato: 'QTH EXATO',
  qraResponsavel: 'QRA DO RESPONSÁVEL',
  baixaFrequencia: 'BAIXA FREQUÊNCIA',
  qtrInicio: 'QTR DE INÍCIO',
  qtrTermino: 'QTR DE TÉRMINO',
  qthInicio: 'QTH DE INÍCIO',
  qthTermino: 'QTH DE TÉRMINO',
  tipoDeObra: 'TIPO DE OBRA',
  tipoDeDefeito: 'TIPO DE DEFEITO',
  nomeDaPlaca: 'NOME DA PLACA',
  tipoDeServico: 'TIPO DE SERVIÇO',
  situacao: 'SITUAÇÃO',
  numeroOcorrencia: 'NÚMERO DA OCORRÊNCIA',
};


const formatKey = (key: string) => {
    if (sectionTitles[key]) {
        return sectionTitles[key];
    }
    
    const formattedKey = key
        .replace(/([A-Z])/g, ' $1')
        .replace(/_/g, ' ')
        .replace(/\b\w/g, char => char.toUpperCase());
    
    return autoCorrect(formattedKey);
};


export default function ReportDetail({ formData }: { formData: any }) {
    if (!formData) return <p>Sem detalhes para exibir.</p>;

    const renderSection = (title: string, data: any) => {
        if (!data || Object.keys(data).length === 0) return null;
        
        const filteredData = Object.entries(data).filter(([_, value]) => 
            value !== null && value !== undefined && value !== 'NILL' && value !== '' && (!Array.isArray(value) || value.length > 0)
        );

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
                 <h4 className="text-lg font-semibold mb-2 text-primary">Veículos</h4>
                 {vehicles.map((vehicle, index) => {
                    const filteredVehicleData = Object.entries(vehicle).filter(([key, value]) => key !== 'id' && value !== 'NILL' && value !== '' && (!Array.isArray(value) || value.length > 0));
                    if(filteredVehicleData.length === 0) return null;

                    return (
                        <div key={index} className="mb-6 mt-4 border-t pt-4">
                            <h5 className="text-xl font-semibold mb-2 text-primary/80">Veículo {index + 1}</h5>
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
            {Object.entries(formData).map(([key, data]) => {
                const title = sectionTitles[key as keyof typeof sectionTitles] || formatKey(key);
                if (key === 'vehicles') {
                    return renderVehicleSection(data as any[]);
                }
                return renderSection(title, data);
            })}
        </div>
    );
};
