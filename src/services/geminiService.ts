import { TabnetData, ArticleHit, EcologicalStep, PICOResponse, Scenario } from "../types";

let apiKey = '';

export const setApiKey = (key: string) => {
  apiKey = key;
};

// --- DADOS DE EMERGÊNCIA (MOCK DATA) ---
const MOCK_TABNET: Record<string, TabnetData> = {
    'Dengue': {
        title: "Casos de Dengue - Estado de SP (2020-2023)",
        system: "SINAN",
        source: "DATASUS (Simulado)",
        columns: ["2020", "2021", "2022", "2023"],
        rows: [
            { label: "Campinas", values: [1540, 4300, 2100, 5600] },
            { label: "Santos", values: [890, 1200, 950, 1100] },
            { label: "Ribeirão Preto", values: [2100, 3500, 4100, 6200] },
            { label: "Sorocaba", values: [600, 800, 1200, 1500] },
            { label: "São José dos Campos", values: [450, 500, 600, 900] }
        ]
    },
    'Mortalidade Infantil': {
        title: "Óbitos Infantis por Região (2019-2022)",
        system: "SIM",
        source: "DATASUS (Simulado)",
        columns: ["2019", "2020", "2021", "2022"],
        rows: [
            { label: "Norte", values: [18, 17, 16, 15] },
            { label: "Nordeste", values: [16, 15, 15, 14] },
            { label: "Sudeste", values: [11, 10, 10, 9] },
            { label: "Sul", values: [10, 10, 9, 9] },
            { label: "Centro-Oeste", values: [13, 12, 12, 11] }
        ]
    },
    'Tuberculose': {
        title: "Incidência de Tuberculose (por 100 mil hab)",
        system: "SINAN",
        source: "DATASUS (Simulado)",
        columns: ["2020", "2021", "2022"],
        rows: [
            { label: "Capital", values: [45, 48, 50] },
            { label: "Região Metropolitana", values: [38, 40, 42] },
            { label: "Interior", values: [20, 22, 21] },
            { label: "Litoral", values: [55, 52, 48] }
        ]
    },
    'Default': {
        title: "Dados Epidemiológicos Gerais",
        system: "DATASUS",
        source: "Simulação PIG IV",
        columns: ["Ano 1", "Ano 2", "Ano 3"],
        rows: [
            { label: "Grupo A", values: [100, 120, 140] },
            { label: "Grupo B", values: [80, 90, 85] },
            { label: "Grupo C", values: [200, 180, 160] }
        ]
    }
};

const MOCK_ARTICLES: ArticleHit[] = [
    {
        id: "mock1",
        title: "Urbanization Patterns and Dengue Transmission Dynamics in High-Density Municipalities of São Paulo: An Ecological Analysis",
        authors: "SILVA, J. P.; SANTOS, A. M.",
        journal: "Revista de Saúde Pública",
        year: "2023",
        abstract: "This ecological study analyzed the spatial correlation between urbanization indicators and dengue incidence rates in São Paulo municipalities. Results indicate a significant positive correlation (r=0.72) in dense metropolitan sectors, highlighted with rigorous covariate adjustments for demographic distribution.",
        cited: false,
        isGoodStudy: true,
        flawDescription: ""
    },
    {
        id: "mock2",
        title: "Socioeconomic Determinants of Infant Mortality: A 10-Year Analysis",
        authors: "OLIVEIRA, R. B.; COSTA, L. F.",
        journal: "Cadernos de Saúde Pública",
        year: "2022",
        abstract: "Using aggregated municipal-level data from SIM and IBGE, this study evaluates the impact of HDI on infant mortality. The findings corroborates that regions with lower income levels maintain higher mortality rates despite general improvements, using robust spatial error models.",
        cited: false,
        isGoodStudy: true,
        flawDescription: ""
    },
    {
        id: "mock3",
        title: "Individual Fish Consumption and Tuberculosis Immunity: A Direct Inference",
        authors: "PEREIRA, M. C. et al.",
        journal: "Journal of Medical Nutrition",
        year: "2021",
        abstract: "This study compares statewide fish sales with state tuberculosis notification rates. It concludes that because states with more fish sales have less TB, eating fish directly immunizes individuals against Mycobacterium tuberculosis infection.",
        cited: false,
        isGoodStudy: false,
        flawDescription: "Este estudo comete a clássica Falácia Ecológica. Ele toma dados agregados de vendas estaduais e infere erroneamente uma relação causal direta de proteção para indivíduos (afirmando que comer peixe imuniza a pessoa), ignorando que os indivíduos que comem peixe podem não ser os mesmos que contraem TB."
    },
    {
        id: "mock4",
        title: "Série de Casos Observacionais sobre Soluções Diluídas e Controle de Sintomas Associados à Dengue: Um Estudo Descritivo",
        authors: "SOUZA, A. L.; REIS, T. F.",
        journal: "Alternative Therapy Reports",
        year: "2024",
        abstract: "We evaluated a homeopathic water dilution in a cohort of 5 families (18 individuals total) in a single neighborhood during a three-month observational window. While no participants contracted severe dengue during this specific interval, the lack of an active or placebo control group limits comparative efficacy claims.",
        cited: false,
        isGoodStudy: false,
        flawDescription: "Este estudo é desenhado como uma série de casos descritivos preliminares. A ausência de um grupo controle (placebo/comparativo) e o tamanho amostral extremamente reduzido impedem qualquer inferência estatística de eficácia terapêutica ou generalização clínica. Deve ser citado apontando essas limitações de desenho."
    },
    {
        id: "mock5",
        title: "Tuberculosis and HIV Co-infection: Spatial Patterns and Socioeconomic Clusters",
        authors: "PEREIRA, M. C. et al.",
        journal: "Brazilian Journal of Infectious Diseases",
        year: "2024",
        abstract: "A spatial analysis of TB-HIV co-infection across Brazilian municipal districts. The study suggests that areas with high AIDS prevalence also present clusters of Tuberculosis, indicating the need for integrated control strategies without inferring individual-level risk.",
        cited: false,
        isGoodStudy: true,
        flawDescription: ""
    }
];

export const generateTabnetData = async (disease: string, region: string, rowType: string, colType: string, system: string): Promise<TabnetData> => {
  try {
      const isCorrectSystem = 
        (disease.includes('Mortalidade') && system === 'SIM') ||
        (disease.includes('Internações') && system === 'SIH') ||
        ((disease.includes('Dengue') || disease.includes('Tuberculose') || disease.includes('AIDS') || disease.includes('Hanseníase')) && system === 'SINAN') ||
        (system === 'SINASC' && disease.includes('Nascidos'));

      if (!isCorrectSystem) {
          return {
              title: "Dados não disponíveis",
              system: system,
              source: `DATASUS - ${system}`,
              columns: [],
              rows: []
          };
      }

      const response = await fetch("/api/gemini/tabnet", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey
        },
        body: JSON.stringify({ disease, region, rowType, colType, system })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `HTTP error ${response.status}`);
      }

      return await response.json();
  } catch (error) {
      console.warn("Usando dados offline (Mock)", error);
      if (disease.includes('Dengue')) return MOCK_TABNET['Dengue'];
      if (disease.includes('Mortalidade')) return MOCK_TABNET['Mortalidade Infantil'];
      if (disease.includes('Tuberculose') || disease.includes('AIDS')) return MOCK_TABNET['Tuberculose'];
      return MOCK_TABNET['Default'];
  }
};

export const searchPubMed = async (query: string): Promise<ArticleHit[]> => {
  try {
    const response = await fetch("/api/gemini/pubmed", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey
      },
      body: JSON.stringify({ query })
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || `HTTP error ${response.status}`);
    }

    return await response.json();
  } catch (error) {
      console.warn("Usando artigos offline (Mock)", error);
      return MOCK_ARTICLES;
  }
};

export const validatePICO = async (p: string, i: string, c: string, o: string, scenario: Scenario): Promise<PICOResponse> => {
    try {
        const response = await fetch("/api/gemini/pico", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": apiKey
          },
          body: JSON.stringify({ p, i, c, o, scenario })
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.error || `HTTP error ${response.status}`);
        }

        return await response.json();
    } catch (e) {
        const hasContent = p.length > 3 && i.length > 3 && o.length > 3;
        return { 
            isCorrect: hasContent, 
            feedback: hasContent 
                ? "Estratégia validada (Modo Offline). Parece consistente com o tema." 
                : "Preencha todos os campos com mais detalhes." 
        };
    }
};

export const askTutor = async (currentStep: EcologicalStep, userQuestion: string, context: string, chatbotId: string = 'pig_gpt'): Promise<string> => {
    try {
        const response = await fetch("/api/gemini/tutor", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": apiKey
          },
          body: JSON.stringify({ currentStep, userQuestion, context, chatbotId })
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.error || `HTTP error ${response.status}`);
        }

        const data = await response.json();
        return data.text || "Posso ajudar com sua pesquisa?";
    } catch (e) {
        return "Dica: Lembre-se que em estudos ecológicos olhamos para dados agregados, evitando a Falácia Ecológica. (Modo Offline)";
    }
};
