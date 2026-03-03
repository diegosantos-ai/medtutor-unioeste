// Dados mockados para funcionar sem backend
// Ideal para deploy no Vercel sem servidor

export interface MockFlashcard {
  id: number;
  front: string;
  back: string;
  topic: string;
  next_review: string;
  box: number;
}

export interface MockQuestion {
  id: string;
  question_id?: string;
  enunciado: string;
  materia: string;
  assunto: string;
  alternativas: Record<string, string>;
  resposta_correta: string;
  sua_resposta?: string;
  explicacao: string;
  data_erro?: string;
  data?: string;
}

export interface MockClinicalCase {
  id: string;
  titulo: string;
  descricao: string;
  dificuldade: string;
  etapas: Array<{
    id: number;
    tipo: string;
    pergunta: string;
    alternativas: Record<string, string>;
    resposta_correta: string;
  }>;
}

// Flashcards de Medicina UNIOESTE
export const MOCK_FLASHCARDS: MockFlashcard[] = [
  {
    id: 1,
    front: "Qual é a função das mitocôndrias?",
    back: "Produção de ATP (energia) através da respiração celular. São as 'usinas de energia' da célula.",
    topic: "Citologia",
    next_review: new Date().toISOString(),
    box: 0
  },
  {
    id: 2,
    front: "O que é a homeostase?",
    back: "Manutenção do equilíbrio interno do organismo, mantendo parâmetros como temperatura, pH e concentração de glicose estáveis.",
    topic: "Fisiologia",
    next_review: new Date().toISOString(),
    box: 0
  },
  {
    id: 3,
    front: "Quais são as bases nitrogenadas do DNA?",
    back: "Adenina (A), Timina (T), Guanina (G) e Citosina (C). A pareia com T, e G pareia com C.",
    topic: "Genética",
    next_review: new Date().toISOString(),
    box: 0
  },
  {
    id: 4,
    front: "O que é o sistema imunológico inato?",
    back: "Primeira linha de defesa do organismo, composta por barreiras físicas (pele), químicas (lisoenzimas) e células (fagócitos).",
    topic: "Imunologia",
    next_review: new Date().toISOString(),
    box: 0
  },
  {
    id: 5,
    front: "Qual a diferença entre mitose e meiose?",
    back: "Mitose: divisão celular que resulta em 2 células idênticas (2n). Meiose: divisão que resulta em 4 células com metade dos cromossomos (n), para gametas.",
    topic: "Citologia",
    next_review: new Date().toISOString(),
    box: 0
  },
  {
    id: 6,
    front: "Quantos ossos tem o corpo humano adulto?",
    back: "206 ossos. Bebês nascem com aproximadamente 270, mas muitos se fundem durante o desenvolvimento.",
    topic: "Anatomia",
    next_review: new Date().toISOString(),
    box: 0
  },
  {
    id: 7,
    front: "Qual é o maior órgão do corpo humano?",
    back: "A pele (integumento), com área média de 1,5-2m² e peso de 3,5-10kg.",
    topic: "Anatomia",
    next_review: new Date().toISOString(),
    box: 0
  },
  {
    id: 8,
    front: "O que é o sistema nervoso autônomo?",
    back: "Divisão do SNP que controla funções involuntárias. Dividido em: Simpático (ação/fuga) e Parassimpático (repouso/digestão).",
    topic: "Fisiologia",
    next_review: new Date().toISOString(),
    box: 0
  },
  {
    id: 9,
    front: "O que é a glicólise?",
    back: "Quebra da glicose em ácido pirúvico, ocorrendo no citoplasma. Produz 2 ATP e 2 NADH (por glicose).",
    topic: "Bioquímica",
    next_review: new Date().toISOString(),
    box: 0
  },
  {
    id: 10,
    front: "Qual a função das enzimas?",
    back: "Catalisar reações químicas, diminuindo a energia de ativação sem serem consumidas na reação.",
    topic: "Bioquímica",
    next_review: new Date().toISOString(),
    box: 0
  }
];

// Questões UNIOESTE para Caderno de Erros
export const MOCK_ERROR_QUESTIONS: MockQuestion[] = [
  {
    id: "BIO-001",
    question_id: "BIO-001",
    enunciado: "Em um cruzamento entre plantas de ervilha, uma planta de flores roxas homozigótica (PP) foi cruzada com uma de flores brancas homozigótica (pp). Qual será o fenótipo da F1?",
    materia: "Biologia",
    assunto: "Genética",
    alternativas: {
      "A": "100% flores roxas",
      "B": "100% flores brancas",
      "C": "50% roxas e 50% brancas",
      "D": "75% roxas e 25% brancas"
    },
    resposta_correta: "A",
    sua_resposta: "C",
    explicacao: "O cruzamento PP x pp resulta em 100% Pp (heterozigotos). Como o alelo P (roxo) é dominante sobre p (branco), todos os descendentes terão flores roxas.",
    data_erro: "2026-03-01T10:00:00Z",
    data: "2026-03-01T10:00:00Z"
  },
  {
    id: "BIO-002",
    question_id: "BIO-002",
    enunciado: "Qual organela celular é responsável pela síntese de proteínas?",
    materia: "Biologia",
    assunto: "Citologia",
    alternativas: {
      "A": "Mitocôndria",
      "B": "Ribossomo",
      "C": "Complexo de Golgi",
      "D": "Lisossomo"
    },
    resposta_correta: "B",
    sua_resposta: "A",
    explicacao: "Os ribossomos são as organelas responsáveis pela síntese proteica, traduzindo o RNA mensageiro em cadeias polipeptídicas.",
    data_erro: "2026-03-02T14:30:00Z",
    data: "2026-03-02T14:30:00Z"
  },
  {
    id: "QUI-001",
    question_id: "QUI-001",
    enunciado: "Qual função orgânica está presente na molécula de etanol?",
    materia: "Química",
    assunto: "Química Orgânica",
    alternativas: {
      "A": "Aldeído",
      "B": "Cetona",
      "C": "Álcool",
      "D": "Ácido carboxílico"
    },
    resposta_correta: "C",
    sua_resposta: "A",
    explicacao: "O etanol (C₂H₅OH) possui o grupo funcional hidroxila (-OH) ligado a carbono saturado, caracterizando a função álcool.",
    data_erro: "2026-03-02T16:00:00Z",
    data: "2026-03-02T16:00:00Z"
  },
  {
    id: "FIS-001",
    question_id: "FIS-001",
    enunciado: "Um resistor de 10Ω é percorrido por uma corrente de 2A. Qual a tensão aplicada?",
    materia: "Física",
    assunto: "Eletrodinâmica",
    alternativas: {
      "A": "5V",
      "B": "10V",
      "C": "15V",
      "D": "20V"
    },
    resposta_correta: "D",
    sua_resposta: "B",
    explicacao: "Pela Lei de Ohm: V = R × i = 10Ω × 2A = 20V",
    data_erro: "2026-03-03T09:00:00Z",
    data: "2026-03-03T09:00:00Z"
  }
];

// Casos Clínicos para Simulado
export const MOCK_CLINICAL_CASES: MockClinicalCase[] = [
  {
    id: "CASE-001",
    titulo: "Caso Clínico #1: Membrana Plasmática",
    descricao: "A membrana plasmática é uma estrutura fundamental para a célula, sendo responsável pela permeabilidade seletiva e pela comunicação celular.",
    dificuldade: "Média",
    etapas: [
      {
        id: 1,
        tipo: "diagnostico",
        pergunta: "Qual modelo descreve a estrutura da membrana plasmática?",
        alternativas: {
          "A": "Modelo de camada dupla rígida de Robertson (1960)",
          "B": "Modelo do Mosaico Fluido de Singer e Nicolson (1972)",
          "C": "Modelo de Danielli e Davson de camada proteica contínua"
        },
        resposta_correta: "B"
      }
    ]
  },
  {
    id: "CASE-002",
    titulo: "Caso Clínico #2: Transporte Celular",
    descricao: "O transporte de glicose do sangue para as células é facilitado pela insulina, um hormônio crucial no metabolismo.",
    dificuldade: "Difícil",
    etapas: [
      {
        id: 1,
        tipo: "diagnostico",
        pergunta: "Que tipo de transporte é utilizado para a entrada de glicose nas células?",
        alternativas: {
          "A": "Transporte ativo primário (bomba de sódio-potássio)",
          "B": "Difusão facilitada mediada por proteínas transportadoras (GLUT)",
          "C": "Osmose através de aquaporinas"
        },
        resposta_correta: "B"
      }
    ]
  },
  {
    id: "CASE-003",
    titulo: "Caso Clínico #3: Genética Mendeliana",
    descricao: "Análise de hereditariedade em plantas de ervilha seguindo os princípios de Mendel.",
    dificuldade: "Média",
    etapas: [
      {
        id: 1,
        tipo: "diagnostico",
        pergunta: "Em ervilhas, a cor amarela (V) é dominante sobre a verde (v). Cruzando Vv x Vv, qual a proporção fenotípica?",
        alternativas: {
          "A": "100% amarelas",
          "B": "50% amarelas e 50% verdes",
          "C": "75% amarelas e 25% verdes"
        },
        resposta_correta: "C"
      }
    ]
  }
];

// Estatísticas mockadas
export const MOCK_STATS = {
  total_questions: 24,
  correct_answers: 18,
  accuracy: 75,
  flashcards_reviewed_today: 5,
  total_flashcards: 10,
  streak: 3,
  study_days: 7
};

// Usuário demo
export const MOCK_USER = {
  id: 1,
  email: "demo@medtutor.com",
  name: "Estudante Demo",
  daily_hours: 4,
  difficulties: ["Física", "Matemática"],
  learning_style: "visual",
  has_onboarded: true,
  streak: 3,
  is_active: true,
  created_at: new Date().toISOString()
};
