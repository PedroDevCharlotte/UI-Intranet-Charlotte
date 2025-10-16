// Tipos para el formulario de No Conformidades
export interface NonConformityFormValues {
  // Tab General
  number: string;
  description: string;
  validFrom: string;
  detectedAt: string;
  validTo: string;
  areaOrProcess: string;
  classification: string;
  category: string;
  typeOptionId: string | number;
  otherType: string;
  motiveOptionId: string | number;
  otherMotive: string;
  areaResponsibleId: number | null;
  findingDescription: string;
  investigationReference: string;
  observations: string;
  reference: string;
  createdAtDate: string;
  closedAt: string;

  // Tab Actions
  cause: string;
  actionPlans: ActionPlan[];

  // Tab FiveWhys
  fiveWhysParticipants: UserOption[];
  otherParticipant: string;
  fiveWhysDate: string;
  hasSimilarCases: boolean;
  similarCasesDetails: string;

  // Tab Why Problem
  whyProblem1: string;
  whyProblem2: string;
  whyProblem3: string;
  whyProblem4: string;
  whyProblem5: string;

  // Tab Why Not Detected
  whyNotDetected1: string;
  whyNotDetected2: string;
  whyNotDetected3: string;
  whyNotDetected4: string;
  whyNotDetected5: string;

  // Tab Root Cause
  rootCauseDetermination: string;

  // Tab Follow Ups
  followUps: FollowUp[];

  // Otros
  attachment: File | null;
}

export interface UserOption {
  id: number;
  label: string;
}

export interface ActionPlan {
  id: string;
  description: string;
  commitmentDate: string;
  responsibles: UserOption[];
  type: 'principal' | 'secundaria';
}

export interface FollowUp {
  id: string;
  date: string;
  verifiedBy: UserOption | null;
  verifiedByOther: string;
  justification: string;
  wasEffective: boolean;
}

export interface FormikProps {
  values: NonConformityFormValues;
  handleChange: (e: React.ChangeEvent<any>) => void;
  setFieldValue: (field: string, value: any) => void;
  errors?: any;
  touched?: any;
}

// Tipos para las respuestas del API
export interface WhyRecord {
  type: 'WHY_HAD_PROBLEM' | 'WHY_NOT_DETECTED';
  questionNumber: number;
  answer: string;
}

export interface NonConformityApiPayload {
  number: string | null;
  description: string | null;
  validFrom: string | null;
  detectedAt: string | null;
  validTo: string | null;
  areaOrProcess: string | null;
  classification: string | null;
  category: string | null;
  typeOptionId: number | null;
  otherType: string | null;
  motiveOptionId: number | null;
  otherMotive: string | null;
  areaResponsibleId: number | null;
  findingDescription: string | null;
  investigationReference: string | null;
  observations: string | null;
  reference: string | null;
  createdAtDate: string | null;
  closedAt: string | null;
  cause: string | null;
  rootCauseDetermination: string | null;
  
  actionPlans: {
    description: string;
    commitmentDate: string;
    type: string;
    responsibleOptionId: number | null;
  }[];
  
  followUps: {
    date: string;
    verifiedBy: number | null;
    verifiedByOther: string | null;
    justification: string;
    isEffective: boolean;
  }[];
  
  fiveWhysParticipants: {
    id: number;
    label: string;
  }[];
  
  otherParticipant: string | null;
  fiveWhysDate: string | null;
  hasSimilarCases: boolean;
  similarCasesDetails: string | null;
  
  whyRecords: WhyRecord[];
}

// Tipos para las opciones de listas generales
export interface GeneralListOption {
  id: number;
  name: string;
  value?: any;
}

// Props comunes para los tabs
export interface TabProps {
  formik: FormikProps;
  userOptions?: UserOption[];
  typeOptions?: GeneralListOption[];
  motiveOptions?: GeneralListOption[];
  areaOptions?: GeneralListOption[];
}