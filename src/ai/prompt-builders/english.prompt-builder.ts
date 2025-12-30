import {
  PromptBuilder,
  PromptTemplate,
  EvaluationPromptTemplate,
} from './prompt-builder.abstract';

export class EnglishPromptBuilder extends PromptBuilder {
  getQuestionGenerationTemplate(): PromptTemplate {
    return {
      systemRole:
        'You are an expert interviewer. Based on the detailed job description below, create appropriate interview questions:',
      jobDescriptionLabel: 'Detailed Job Description',
      interviewDetailsLabel: 'Interview Requirements',
      industryLabel: 'Industry',
      levelLabel: 'Level',
      stackLabel: 'Technology Stack',
      positionLabel: 'Position',
      numQuestionsLabel: 'number of questions',
      requirementsLabel: 'Question Creation Requirements',
      requirements: [
        'Analyze the Detailed Job Description carefully to identify specific technical requirements',
        'Create questions appropriate for the position, level, and required technology',
        'Generate diverse questions covering technical skills, problem-solving, and practical experience',
        'Include a mix of difficulty levels (EASY, MEDIUM, HARD)',
        'ALL questions must be TEXT type only (no VIDEO questions for now)',
        'Provide expected/model answers for each question',
        'Prioritize topics and technologies explicitly mentioned in the job description',
      ],
      stackRequirement: (stack: string) =>
        `Focus on ${stack}-specific technologies and best practices`,
      jsonFormatInstruction:
        'Return the response in JSON format with a "questions" array containing objects with structure: {questionText: "question content", expectedAnswer: "detailed expected answer", difficulty: "EASY | MEDIUM | HARD", questionType: "TEXT"}. Example: {"questions":[{"questionText":"Question content","expectedAnswer":"Detailed answer","difficulty":"MEDIUM","questionType":"TEXT"}]}',
      questionTextLabel: 'questionText',
      expectedAnswerLabel: 'expectedAnswer',
    };
  }

  getEvaluationTemplate(): EvaluationPromptTemplate {
    return {
      systemRole:
        'You are an expert technical interviewer. Evaluate the following mock interview answers.',
      mockInterviewDetailsLabel: 'Mock Interview Details',
      levelLabel: 'Level',
      industryLabel: 'Industry',
      stackLabel: 'Stack',
      positionLabel: 'Position',
      questionLabel: 'Question',
      expectedAnswerLabel: 'Expected Answer',
      candidateAnswerLabel: "Candidate's Answer",
      difficultyLabel: 'Difficulty',
      evaluationRequirements: [
        'Analyze technical accuracy and completeness of responses',
        'Assess communication skills and clarity of explanations',
        'Evaluate problem-solving approach and methodology',
        'Provide constructive feedback for improvement',
        'MUST assign score 0 if the answer is "No answer", "I don\'t know", or meaningless.',
        'Assign a score (0-100) for EACH question. Be strict and fair.',
        'Provide detailed, educational `expectedAnswer` and `feedback` to help the candidate learn.',
      ],
      requirementsLabel: 'Evaluation Requirements',
      jsonFormatInstruction:
        'Return ONLY valid JSON (no markdown formatting, no ```json wrapper). Example: {"overallScore": 85, "strengths": ["Strong PHP knowledge"], "weaknesses": ["Weak on security"], "recommendations": ["Study CSRF"], "detailedFeedback": [{"questionText": "What is DI?", "score": 80, "feedback": "Explanation lacked depth. DI is a design pattern that..."}]}',
      overallScoreLabel: 'overallScore',
      strengthsLabel: 'strengths',
      weaknessesLabel: 'weaknesses',
      recommendationsLabel: 'recommendations',
      detailedFeedbackLabel: 'detailedFeedback',
    };
  }
}
