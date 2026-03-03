// Estrutura de matérias para o Vestibular UNIOESTE - Medicina
// Baseado no modelo tradicional de vestibulares brasileiros com ênfase em ciências da saúde

export interface Subject {
  id: string;
  name: string;
  category: 'biologicas' | 'exatas' | 'humanas' | 'linguagens';
  icon: string;
  color: string;
  topics: string[];
  weight?: number; // Peso na nota (1-5)
}

export interface SubjectCategory {
  id: string;
  name: string;
  description: string;
  color: string;
  subjects: Subject[];
}

export const SUBJECTS_DATA: SubjectCategory[] = [
  {
    id: 'biologicas',
    name: 'Ciências Biológicas',
    description: 'Matérias fundamentais para Medicina',
    color: '#10b981', // emerald-500
    subjects: [
      {
        id: 'biologia',
        name: 'Biologia',
        category: 'biologicas',
        icon: 'Dna',
        color: '#22c55e',
        weight: 5,
        topics: [
          'Citologia',
          'Histologia',
          'Anatomia',
          'Fisiologia Humana',
          'Genética',
          'Ecologia',
          'Evolução',
          'Microbiologia',
          'Parasitologia',
          'Imunologia',
          'Biologia Molecular',
          'Bioquímica'
        ]
      },
      {
        id: 'bioquimica',
        name: 'Bioquímica',
        category: 'biologicas',
        icon: 'FlaskConical',
        color: '#14b8a6',
        weight: 4,
        topics: [
          'Estrutura de Proteínas',
          'Enzimas',
          'Metabolismo Energético',
          'Ciclo de Krebs',
          'Fosforilação Oxidativa',
          'Metabolismo de Carboidratos',
          'Metabolismo de Lipídios',
          'Metabolismo de Aminoácidos',
          'Bioquímica Clínica'
        ]
      },
      {
        id: 'anatomia',
        name: 'Anatomia',
        category: 'biologicas',
        icon: 'Bone',
        color: '#f97316',
        weight: 5,
        topics: [
          'Anatomia Geral',
          'Sistema Esquelético',
          'Sistema Muscular',
          'Sistema Nervoso',
          'Sistema Cardiovascular',
          'Sistema Respiratório',
          'Sistema Digestório',
          'Sistema Urinário',
          'Sistema Reprodutor',
          'Sistema Endócrino',
          'Sistema Linfático'
        ]
      },
      {
        id: 'fisiologia',
        name: 'Fisiologia',
        category: 'biologicas',
        icon: 'Activity',
        color: '#ef4444',
        weight: 5,
        topics: [
          'Fisiologia Celular',
          'Fisiologia do Sistema Nervoso',
          'Fisiologia Cardiovascular',
          'Fisiologia Respiratória',
          'Fisiologia Renal',
          'Fisiologia Digestória',
          'Fisiologia Endócrina',
          'Fisiologia da Reprodução',
          'Fisiologia do Exercício',
          'Homeostase'
        ]
      }
    ]
  },
  {
    id: 'exatas',
    name: 'Ciências Exatas',
    description: 'Base lógica e quantitativa',
    color: '#3b82f6', // blue-500
    subjects: [
      {
        id: 'quimica',
        name: 'Química',
        category: 'exatas',
        icon: 'Atom',
        color: '#8b5cf6',
        weight: 4,
        topics: [
          'Química Geral',
          'Química Orgânica',
          'Química Inorgânica',
          'Físico-Química',
          'Soluções e Diluições',
          'Estequiometria',
          'Termoquímica',
          'Cinética Química',
          'Equilíbrio Químico',
          'Eletroquímica',
          'Radioatividade',
          'Química Ambiental'
        ]
      },
      {
        id: 'fisica',
        name: 'Física',
        category: 'exatas',
        icon: 'Gauge',
        color: '#06b6d4',
        weight: 3,
        topics: [
          'Cinemática',
          'Dinâmica',
          'Estática',
          'Hidrostática',
          'Termologia',
          'Ondulatória',
          'Óptica',
          'Eletrostática',
          'Eletrodinâmica',
          'Eletromagnetismo',
          'Física Moderna',
          'Física Nuclear'
        ]
      },
      {
        id: 'matematica',
        name: 'Matemática',
        category: 'exatas',
        icon: 'Calculator',
        color: '#6366f1',
        weight: 3,
        topics: [
          'Aritmética',
          'Álgebra',
          'Funções',
          'Geometria Plana',
          'Geometria Espacial',
          'Trigonometria',
          'Análise Combinatória',
          'Probabilidade',
          'Estatística',
          'Matemática Financeira',
          'Progressões',
          'Logaritmos'
        ]
      }
    ]
  },
  {
    id: 'humanas',
    name: 'Ciências Humanas',
    description: 'Contexto social e histórico',
    color: '#a855f7', // purple-500
    subjects: [
      {
        id: 'historia',
        name: 'História',
        category: 'humanas',
        icon: 'Landmark',
        color: '#d97706',
        weight: 2,
        topics: [
          'História Antiga',
          'História Medieval',
          'História Moderna',
          'História Contemporânea',
          'História do Brasil',
          'História da Medicina',
          'História da Ciência',
          'Revoluções Científicas',
          'Eras da Saúde Pública'
        ]
      },
      {
        id: 'geografia',
        name: 'Geografia',
        category: 'humanas',
        icon: 'Globe',
        color: '#0ea5e9',
        weight: 2,
        topics: [
          'Geografia Física',
          'Geografia Humana',
          'Geopolítica',
          'Geografia do Brasil',
          'Geografia da Saúde',
          'Epidemiologia Geográfica',
          'Mudanças Climáticas',
          'Demografia'
        ]
      },
      {
        id: 'filosofia',
        name: 'Filosofia',
        category: 'humanas',
        icon: 'BookOpen',
        color: '#84cc16',
        weight: 2,
        topics: [
          'Filosofia Antiga',
          'Filosofia Medieval',
          'Filosofia Moderna',
          'Filosofia Contemporânea',
          'Ética',
          'Bioética',
          'Filosofia da Ciência',
          'Lógica',
          'Teoria do Conhecimento'
        ]
      },
      {
        id: 'sociologia',
        name: 'Sociologia',
        category: 'humanas',
        icon: 'Users',
        color: '#ec4899',
        weight: 2,
        topics: [
          'Sociologia Geral',
          'Movimentos Sociais',
          'Sociologia da Saúde',
          'Saúde Pública',
          'SUS',
          'Políticas de Saúde',
          'Direitos Sociais',
          'Desigualdades Sociais',
          'Sociologia do Trabalho'
        ]
      }
    ]
  },
  {
    id: 'linguagens',
    name: 'Linguagens',
    description: 'Comunicação e expressão',
    color: '#f59e0b', // amber-500
    subjects: [
      {
        id: 'portugues',
        name: 'Língua Portuguesa',
        category: 'linguagens',
        icon: 'Type',
        color: '#eab308',
        weight: 3,
        topics: [
          'Gramática',
          'Interpretação de Texto',
          'Gêneros Textuais',
          'Literatura Brasileira',
          'Literatura Portuguesa',
          'Literatura Africana',
          'Figuras de Linguagem',
          'Funções da Linguagem',
          'Variação Linguística'
        ]
      },
      {
        id: 'ingles',
        name: 'Inglês',
        category: 'linguagens',
        icon: 'MessageCircle',
        color: '#3b82f6',
        weight: 2,
        topics: [
          'Compreensão de Texto',
          'Vocabulário Técnico',
          'Terminologia Médica',
          'Interpretação de Artigos Científicos',
          'Tradução de Textos'
        ]
      },
      {
        id: 'espanhol',
        name: 'Espanhol',
        category: 'linguagens',
        icon: 'MessageSquare',
        color: '#f97316',
        weight: 1,
        topics: [
          'Compreensão de Texto',
          'Vocabulário Básico',
          'Interpretação de Textos'
        ]
      },
      {
        id: 'redacao',
        name: 'Redação',
        category: 'linguagens',
        icon: 'PenTool',
        color: '#dc2626',
        weight: 5,
        topics: [
          'Estrutura Dissertativa-Argumentativa',
          'Repertório Sociocultural',
          'Proposta de Intervenção',
          'Saúde e Sociedade',
          'Bioética',
          'Saúde Pública',
          'Medicina e Humanidade',
          'Temas de Vestibular UNIOESTE'
        ]
      }
    ]
  }
];

// Matérias mais importantes para Medicina (ordenadas por peso)
export const MEDICINE_PRIORITY_SUBJECTS = [
  'biologia',
  'anatomia',
  'fisiologia',
  'bioquimica',
  'quimica',
  'redacao',
  'portugues',
  'fisica',
  'matematica',
  'historia',
  'geografia',
  'ingles'
];

// Cores por categoria para UI
export const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  biologicas: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200'
  },
  exatas: {
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200'
  },
  humanas: {
    bg: 'bg-purple-50',
    text: 'text-purple-700',
    border: 'border-purple-200'
  },
  linguagens: {
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200'
  }
};

// Helper para encontrar matéria por ID
export function getSubjectById(id: string): Subject | undefined {
  for (const category of SUBJECTS_DATA) {
    const subject = category.subjects.find(s => s.id === id);
    if (subject) return subject;
  }
  return undefined;
}

// Helper para obter todas as matérias como array simples
export function getAllSubjects(): Subject[] {
  return SUBJECTS_DATA.flatMap(category => category.subjects);
}

// Helper para obter nomes das matérias (para selects/forms)
export function getSubjectNames(): { value: string; label: string; category: string }[] {
  return getAllSubjects().map(subject => ({
    value: subject.id,
    label: subject.name,
    category: subject.category
  }));
}
