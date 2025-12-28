import { GenerateQuestionsInput } from '../ai.abstract';

export interface BasePromptTemplate {
  systemRole: string;
  jsonFormatInstruction: string;
}

export type PromptTemplate = QuestionGenerationTemplate;

export interface QuestionGenerationTemplate extends BasePromptTemplate {
  jobDescriptionLabel: string;
  interviewDetailsLabel: string;
  industryLabel: string;
  levelLabel: string;
  stackLabel: string;
  positionLabel: string;
  numQuestionsLabel: string;
  requirementsLabel: string;
  requirements: string[];
  stackRequirement: (stack: string) => string;
  questionTextLabel: string;
  expectedAnswerLabel: string;
}

export interface QAForEvaluation {
  questionText: string;
  expectedAnswer: string;
  candidateAnswer: string;
  difficulty: string;
}

export interface EvaluationSessionInfo {
  level: string;
  industry: string;
  stack?: string;
  position?: string;
}

export interface EvaluationPromptTemplate extends BasePromptTemplate {
  mockInterviewDetailsLabel: string;
  levelLabel: string;
  industryLabel: string;
  stackLabel: string;
  positionLabel: string;
  questionLabel: string;
  expectedAnswerLabel: string;
  candidateAnswerLabel: string;
  difficultyLabel: string;
  evaluationRequirements: string[];
  requirementsLabel: string;
  overallScoreLabel: string;
  strengthsLabel: string;
  weaknessesLabel: string;
  recommendationsLabel: string;
  detailedFeedbackLabel: string;
}

export abstract class PromptBuilder {
  constructor() {}

  buildQuestionPrompt(input: GenerateQuestionsInput): string {
    const template = this.getQuestionGenerationTemplate();

    let processedJdText = input.jdText;
    if (input.jdText.startsWith(template.systemRole)) {
      processedJdText = input.jdText
        .substring(template.systemRole.length)
        .trim();
      if (processedJdText.startsWith(`${template.jobDescriptionLabel}:`)) {
        const regex = new RegExp(
          `^${template.jobDescriptionLabel}\\s*:\\s*`,
          'i',
        );
        processedJdText = processedJdText.replace(regex, '').trim();
      }
    }

    // Check if job description already contains interview details to avoid duplication
    const jdTextLower = processedJdText.toLowerCase();
    const containsIndustry =
      input.industry && jdTextLower.includes(input.industry.toLowerCase());
    const containsLevel =
      input.level && jdTextLower.includes(input.level.toLowerCase());
    const containsStack =
      input.stack && jdTextLower.includes(input.stack.toLowerCase());
    const containsPosition =
      input.position && jdTextLower.includes(input.position.toLowerCase());

    // Only include interview details that are not already in the job description
    const shouldIncludeInterviewDetails = !(
      containsIndustry &&
      containsLevel &&
      containsStack &&
      containsPosition
    );

    let interviewDetailsSection = '';
    if (shouldIncludeInterviewDetails) {
      interviewDetailsSection = `
${template.interviewDetailsLabel}: 
- ${template.industryLabel}: ${input.industry}
- ${template.levelLabel}: ${input.level}
${input.stack ? `- ${template.stackLabel}: ${input.stack}` : ''}
${input.position ? `- ${template.positionLabel}: ${input.position}` : ''}
- ${template.numQuestionsLabel}: ${input.numQuestions}
`;
    }

    return `
${template.systemRole}

${template.jobDescriptionLabel}: ${processedJdText}
${interviewDetailsSection}
${template.requirementsLabel}: 
${template.requirements.map((req) => `- ${req}`).join('\n')}

${input.stack ? template.stackRequirement(input.stack) : ''}

${template.jsonFormatInstruction}

${template.questionTextLabel} and ${template.expectedAnswerLabel}:
`.trim();
  }

  buildEvaluationPrompt(
    questionsAndAnswers: QAForEvaluation[],
    session?: any,
  ): string {
    const template = this.getEvaluationTemplate();

    const qaList = questionsAndAnswers
      .map(
        (qa, index) => `
Question ${index + 1}: ${qa.questionText}
Expected Answer: ${qa.expectedAnswer}
Candidate Answer: ${qa.candidateAnswer}
Difficulty: ${qa.difficulty}
`,
      )
      .join('');

    return `
${template.systemRole}

${template.mockInterviewDetailsLabel}:
- ${template.levelLabel}: ${session?.level || ''}
- ${template.industryLabel}: ${session?.industry || ''}
${session?.stack ? `- ${template.stackLabel}: ${session.stack}` : ''}
${session?.position ? `- ${template.positionLabel}: ${session.position}` : ''}

${qaList}

${template.jsonFormatInstruction}

${template.overallScoreLabel}, ${template.strengthsLabel}, ${template.weaknessesLabel}, ${template.recommendationsLabel}, and ${template.detailedFeedbackLabel}:
`.trim();
  }

  abstract getQuestionGenerationTemplate(): QuestionGenerationTemplate;

  abstract getEvaluationTemplate(): EvaluationPromptTemplate;
}
