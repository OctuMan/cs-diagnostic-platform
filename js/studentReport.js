
import {getSessionsFromLS} from './dashboard.js'

export function generateStudentReport(studentName) {
  const results = getSessionsFromLS();
  const student = results.find(r => 
    `${r.student.firstName.toLowerCase()} ${r.student.lastName.toLowerCase()}` === studentName.toLowerCase()
  );

  if (!student) return null;

  return {
    type: 'Student',
    student: {
      name: `${student.student.firstName} ${student.student.lastName}`,
      className: student.student.className,
      date: student.student.date
    },
    score: {
      percentage: student.results.percentage,
      finalScore: student.results.finalScore,
      totalPoints: student.results.totalPoints
    },
    status: getStudentStatus(student.results.percentage),
    strengths: getStrongTopics(student),
    weaknesses: getWeakTopics(student),
    answers: student.results.knowledgeAnswers,
    infoAnswers: student.results.infoAnswers
  };
}

function getStudentStatus(percentage) {
  return percentage < 45 ? 'Besoin de soutien' :
         percentage < 75 ? 'Intermédiaire' : 'Avancé(e)';
}

function getStrongTopics(student) {
  return Object.entries(student.results.topicPerformance)
    .filter(([topic, data]) => topic !== 'info' && data.percent >= 75)
    .map(([topic]) => formatTopicName(topic));
}

function getWeakTopics(student) {
  return Object.entries(student.results.topicPerformance)
    .filter(([topic, data]) => topic !== 'info' && data.percent < 50)
    .map(([topic]) => formatTopicName(topic));
}

function formatTopicName(topic) {
  const names = {
    'computerSystems': 'Sytèmes Informatiques',
    'inputOutput': 'Input & Output',
    'softwares': 'Softwares'
  };
  return names[topic] || topic.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
}