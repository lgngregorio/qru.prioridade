
export type MessageCode = { code: string; message: string };
export const messageCodes: MessageCode[] = [
    { code: 'QAP', message: 'Na Escuta' },
    { code: 'QAR', message: 'Autorização para abandonar a escuta' },
    { code: 'QBU', message: 'Agitado, confusão mental, Alucinações' },
    { code: 'QRA', message: 'Prefixo da estação / Operador' },
    { code: 'QRM', message: 'Interferência de outra estação' },
    { code: 'QRV', message: 'Pronto para receber. À disposição' },
    { code: 'QRX', message: 'Espere, aguarde' },
    { code: 'QRU', message: 'Ocorrência. Evento' },
    { code: 'QSA', message: 'Intensidade do Sinal' },
    { code: 'QSJ', message: 'Dinheiro, Pagamento, valor' },
    { code: 'QSL', message: 'Confirmado, compreendido, Afirmativo' },
    { code: 'QSM', message: 'Repetir o último câmbio' },
    { code: 'QSO', message: 'Contato entre duas estações, pessoas' },
    { code: 'QTA', message: 'Cancelar' },
    { code: 'QTC', message: 'Mensagem. Comunicado' },
    { code: 'QTH', message: 'Endereço. Localização' },
    { code: 'QTI', message: 'A caminho. Destino' },
    { code: 'QTO', message: 'Banheiro' },
    { code: 'QTR', message: 'HORA CERTA / EXATA' },
    { code: 'QUD', message: 'Prioridade na rede' },
    { code: 'TKS', message: 'Grato. Obrigado, agradeço' },
];

export type AcaoProvidenciaCode = { code: string; message: string };
export const acaoProvidenciaCodes: AcaoProvidenciaCode[] = [
    { code: 'PR01', message: 'Atendimento inicial' },
    { code: 'PRO2', message: 'Auxílio no combate a incêndio' },
    { code: 'PRO3', message: 'Animal apreendido' },
    { code: 'PRO4', message: 'Retirada de animal morto da pista' },
    { code: 'PR05', message: 'Afugentamento de animal' },
    { code: 'PR06', message: 'Retirada de material da pista' },
    { code: 'PRO7', message: 'Escolta' },
    { code: 'PR08', message: 'Verificação da sinalização de obras' },
    { code: 'PR09', message: 'Outros' },
    { code: 'PR10', message: 'Embargo de obra' },
    { code: 'PR11', message: 'Remoção de vítima para hospital' },
    { code: 'PR12', message: 'Sinalização final de fila' },
    { code: 'PR13', message: 'Canalização/Sinalização' },
    { code: 'PR14', message: 'Tapa buraco' },
    { code: 'PR15', message: 'Orientação a andarilho' },
    { code: 'PR16', message: 'Remoção de andarilho' },
    { code: 'PR17', message: 'Orientação/Informação ao usuário' },
    { code: 'PR18', message: 'Recusa de dados' },
    { code: 'PR19', message: 'Operação comboio' },
    { code: 'PR20', message: 'Atendimento a funcionário' },
    { code: 'PR21', message: 'Remoção de carga derramada' },
    { code: 'PR22', message: 'Limpeza de pista' },
    { code: 'PR23', message: 'Remoção de óleo/outros com serragem' },
    { code: 'PR24', message: 'Troca de pneu' },
    { code: 'PR25', message: 'Pane solucionada' },
    { code: 'PR26', message: 'Transferência de carga' },
    { code: 'PR27', message: 'Remoção de veículo' },
    { code: 'PR28', message: 'Limpeza na praça' },
    { code: 'PR29', message: 'Regularização de Sinalização' },
    { code: 'PR30', message: 'Auxílio no transporte do usuário' },
    { code: 'PR31', message: 'Remoção de vítima das ferragens' },
    { code: 'PR32', message: 'Destombamento de veículo' },
    { code: 'PR33', message: 'Reparo em cerca' },
    { code: 'PR34', message: 'Remoção de placas / publicidade da faixa' },
    { code: 'PR35', message: 'Orientação a lindeiros da faixa de domínio' },
    { code: 'PR36', message: 'Notificação a lindeiros da faixa de domínio' },
    { code: 'PR37', message: 'Implantação de Pare e Siga/ Interdição total' },
    { code: 'PR38', message: 'Transporte de colaborador' },
    { code: 'PR39', message: 'Alocação de PMV móvel' },
    { code: 'PR40', message: 'Definição de mensagem no PMV móvel' },
    { code: 'PR41', message: 'Definição de mensagem no PMV fixo' },
    { code: 'PR42', message: 'Envio de SMS/ Aplicativo' },
    { code: 'PR43', message: 'Envio de Email' },
    { code: 'PR44', message: 'Acionamento de Polícia' },
    { code: 'PR45', message: 'Auxílio a usuário p/comprar combustível' },
    { code: 'PR46', message: 'Não localizado' },
    { code: 'PR47', message: 'Ocorrência não localizada' },
    { code: 'PR48', message: 'Orientação/Acompanhamento de Obra' },
    { code: 'PR49', message: 'Evento acompanhamento pelo CFTV' },
    { code: 'PR50', message: 'Remoção de vítima para P.S' },
    { code: 'PR51', message: 'Efetuado Registro Fotográfico' },
    { code: 'PR53', message: 'Meios próprios' },
    { code: 'PR54', message: 'Aux. com ferram./ Empréstimo ferram.' },
    { code: 'PR55', message: 'Desbloqueio de veículo' },
    { code: 'PR56', message: 'Enterro de Animal' },
    { code: 'PR57', message: 'Atendimento Clínico' },
    { code: 'PR58', message: 'Avaliação da Vítima' },
    { code: 'PR59', message: 'Aferição de pressão arterial' },
    { code: 'PR60', message: 'Subst. de Cancela Praça de Pedágio' },
    { code: 'PR61', message: 'Abordagem de vítima' },
    { code: 'PR62', message: 'Acionamento da Conservação' },
    { code: 'PR63', message: 'Desatolamento de Veículos' },
];

export type OcorrenciaCode = { code: string; message: string; group: string };
export const ocorrenciaCodes: OcorrenciaCode[] = [
    { code: 'ACO1', message: 'Acidente Com Vítima Fatal', group: 'Acidentes' },
    { code: 'AC02', message: 'Acidente Com Vitima', group: 'Acidentes' },
    { code: 'ACO3', message: 'Acidente Sem Vitima', group: 'Acidentes' },
    { code: 'TO01', message: 'Veículo Abandonado', group: 'Incidentes' },
    { code: 'TO02', message: 'Incêndio Na Faixa De Domínio / Lindeiro', group: 'Incidentes' },
    { code: 'TO03', message: 'Animal Na Rodovia', group: 'Incidentes' },
    { code: 'TO04', message: 'Remoção', group: 'Incidentes' },
    { code: 'TO05', message: 'Incêndio Em Veículos', group: 'Incidentes' },
    { code: 'TO06', message: 'Pane Sobre Faixa De Rolamento', group: 'Incidentes' },
    { code: 'TO07', message: 'Objeto Na Pista', group: 'Incidentes' },
    { code: 'TO09', message: 'Obras Na Rodovia / Conservação De Rotina', group: 'Incidentes' },
    { code: 'TO11', message: 'Danos Ao Patrimônio', group: 'Incidentes' },
    { code: 'TO12', message: 'Atendimento Clinico', group: 'Incidentes' },
    { code: 'TO13', message: 'Congestionamento', group: 'Incidentes' },
    { code: 'TO14', message: 'Ocorrência Policial', group: 'Incidentes' },
    { code: 'TO15', message: 'Verificação Faixa De Domínio', group: 'Avarias, Panes' },
    { code: 'TO16', message: 'Atendimento A Funcionário', group: 'Todos' },
    { code: 'TO17', message: 'Andarilho Na Rodovia', group: 'Incidentes' },
    { code: 'TO18', message: 'Alagamento', group: 'Incidentes' },
    { code: 'TO19', message: 'Incidente', group: 'Incidentes' },
    { code: 'TO20', message: 'Carga Excedente', group: 'Avarias, Panes' },
    { code: 'TO21', message: 'Alocação Da PMV Móvel', group: 'Todos' },
    { code: 'TO23', message: 'Usuário Informa', group: 'Todos' },
    { code: 'TO24', message: 'Evasão De Pedágio', group: 'Outros' },
    { code: 'TO25', message: 'Derramamento De Carga', group: 'Todos' },
    { code: 'TO30', message: 'Comunicação Operacional', group: 'Incidentes' },
    { code: 'TO33', message: 'Veículo Atolado', group: 'Incidentes' },
    { code: 'TO34', message: 'Buraco Na Rodovia', group: 'Avarias, Panes' },
    { code: 'TO35', message: 'Óleo Sobre A Pista', group: 'Todos' },
    { code: 'TO36', message: 'Maquinário Na Rodovia', group: 'Monitoramento' },
    { code: 'TO37', message: 'Sinalização Vertical', group: 'Todos' },
    { code: 'TO38', message: 'Placas De Propaganda', group: 'Todos' },
    { code: 'TO39', message: 'Destombamento De Veículo', group: 'Todos' },
    { code: 'TO40', message: 'Manifestação', group: 'Incidentes' },
    { code: 'TO50', message: 'Nível De Serviço, Manutenção Frota / Bases', group: 'Avarias, Panes' },
];

export type TiposPaneCode = { code: string; message: string };
export const tiposPaneCodes: TiposPaneCode[] = [
    { code: 'TP01', message: 'Pane Mecânica' },
    { code: 'TP02', message: 'Pane Elétrica' },
    { code: 'TP03', message: 'Pane Pneu' },
    { code: 'TP04', message: 'Pane Seca' },
    { code: 'TP05', message: 'Super Aquecimento De Motor' },
    { code: 'TP07', message: 'Bloqueio De Veículos Por Rastreador' },
];

export type OutrasMensagensCode = { code: string; message: string };
export const outrasMensagensCodes: OutrasMensagensCode[] = [
    { code: '61', message: 'Sintoma de embriaguez' },
    { code: '62', message: 'Sintomas de entorpecentes ou drogas ilícitas' },
    { code: '63', message: 'PMR - Informação de PMR realizando abordagem no trecho' },
    { code: '64', message: 'AGEMS - informação dos agentes da AGEMS no trecho de concessão' },
    { code: '65', message: 'BRINKS' },
    { code: '67', message: 'PMV inoperante' },
    { code: '70', message: 'Informações de assalto' },
    { code: 'OP08', message: 'Operação Policial' },
    { code: 'OU01', message: 'Ocorrência Fora Do Trecho' },
    { code: 'OU02', message: 'Outros' },
];

export type AlfabetoFonetico = { letra: string; palavra: string; pronuncia: string };
export const alfabetoFonetico: AlfabetoFonetico[] = [
    { letra: 'A', palavra: 'Alpha', pronuncia: 'AL - FA' },
    { letra: 'B', palavra: 'Bravo', pronuncia: 'BRA - VO' },
    { letra: 'C', palavra: 'Charlie', pronuncia: 'CHAR -LIE' },
    { letra: 'D', palavra: 'Delta', pronuncia: 'DEL -TA' },
    { letra: 'E', palavra: 'Echo', pronuncia: 'E - CO' },
    { letra: 'F', palavra: 'Fox', pronuncia: 'FOX - TROT' },
    { letra: 'G', palavra: 'Golf', pronuncia: 'GOL - FE' },
    { letra: 'H', palavra: 'Hotel', pronuncia: 'HO -TEL' },
    { letra: 'I', palavra: 'India', pronuncia: 'IN - DI -A' },
    { letra: 'J', palavra: 'Juliet', pronuncia: 'JU - LI -ETE' },
    { letra: 'K', palavra: 'Kilo', pronuncia: 'KI-LO' },
    { letra: 'L', palavra: 'Lima', pronuncia: 'LI - MA' },
    { letra: 'M', palavra: 'Mike', pronuncia: 'MAI - QUE' },
    { letra: 'N', palavra: 'November', pronuncia: 'NO - VEM - BER' },
    { letra: 'O', palavra: 'Oscar', pronuncia: 'OS - CAR' },
    { letra: 'P', palavra: 'Papa', pronuncia: 'PA - PA' },
    { letra: 'Q', palavra: 'Quebec', pronuncia: 'QUE - BE - QUE' },
    { letra: 'R', palavra: 'Romeo', pronuncia: 'RO - MEU' },
    { letra: 'S', palavra: 'Sierra', pronuncia: 'SI - E - RRA' },
    { letra: 'T', palavra: 'Tango', pronuncia: 'TAN - GO' },
    { letra: 'U', palavra: 'Uniform', pronuncia: 'U - NI- FOR - ME' },
    { letra: 'V', palavra: 'Victor', pronuncia: 'VIC - TOR' },
    { letra: 'W', palavra: 'Whiskey', pronuncia: 'WHIS - KEY' },
    { letra: 'X', palavra: 'X Ray', pronuncia: 'EX - REY' },
    { letra: 'Y', palavra: 'Yankee', pronuncia: 'IAN - QUI' },
    { letra: 'Z', palavra: 'Zulu', pronuncia: 'ZU - LU' },
];

export const allCodes = [
    ...messageCodes,
    ...acaoProvidenciaCodes,
    ...ocorrenciaCodes,
    ...tiposPaneCodes,
    ...outrasMensagensCodes,
    ...alfabetoFonetico
];

export type RelacionamentoOcorrencia = {
    ocorrencia: OcorrenciaCode;
    acoes: AcaoProvidenciaCode[];
    panes?: TiposPaneCode[];
};

export const relacionamentosOcorrencias: RelacionamentoOcorrencia[] = ocorrenciaCodes.map(ocorrencia => {
    let rel: RelacionamentoOcorrencia = {
        ocorrencia,
        acoes: acaoProvidenciaCodes, 
        panes: [],
    };
    
    if(ocorrencia.group === 'Incidentes' || ocorrencia.group === 'Acidentes' || ocorrencia.group === 'Avarias, Panes') {
         rel.panes = tiposPaneCodes;
    }

    return rel;
});
