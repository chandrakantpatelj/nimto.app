// CV Parsing Feedback Messages for Salary Analysis System
// These messages provide real-time feedback to users during CV analysis

const cvFeedbackMessages = {
  education: {
    excellent: [
      "Your educational background is impressive! Top-tier institutions and relevant degrees significantly boost your market value.",
      "Outstanding academic credentials! Your educational foundation positions you well for premium salary ranges.",
      "Excellent educational profile! Your qualifications align perfectly with high-demand market requirements."
    ],
    good: [
      "Your education shows solid fundamentals. Consider adding specialized certifications to enhance your profile further.",
      "Good educational background! Your degree provides a strong foundation for your career trajectory.",
      "Your academic credentials are solid. Additional specialized training could elevate your market position."
    ],
    needsImprovement: [
      "Your experience compensates well, but consider pursuing additional certifications to strengthen your educational profile.",
      "While your practical skills shine, formal education enhancement could unlock higher salary brackets.",
      "Your hands-on experience is valuable. Complementing it with formal qualifications could boost your market value."
    ]
  },

  location: {
    highDemand: [
      "Excellent location choice! You're in a high-demand tech hub with premium salary ranges.",
      "Great market positioning! Your city offers abundant opportunities and competitive compensation packages.",
      "Perfect location strategy! This tech hub commands some of the highest salaries in the industry."
    ],
    moderate: [
      "Good location with decent opportunities. Consider remote work options to access higher-paying markets.",
      "Your city has solid tech presence. Exploring remote opportunities could expand your salary potential.",
      "Reasonable market location. Remote work capabilities could unlock premium salary ranges."
    ],
    emerging: [
      "Emerging tech market! While local salaries may be moderate, remote work could significantly increase your earning potential.",
      "Growing tech scene in your area. Consider building remote work experience to access global salary standards.",
      "Your location is developing its tech ecosystem. Remote capabilities could be your gateway to higher compensation."
    ]
  },

  projectLifecycle: {
    comprehensive: [
      "Impressive project lifecycle experience! Your end-to-end involvement makes you highly valuable to employers.",
      "Excellent project management exposure! Full lifecycle experience commands premium salaries in the market.",
      "Outstanding project depth! Your comprehensive involvement across all phases is a major salary differentiator."
    ],
    partial: [
      "Good project experience! Consider expanding your involvement in different lifecycle phases to increase your market value.",
      "Solid project background. Broadening your lifecycle exposure could unlock higher salary opportunities.",
      "Your project experience is valuable. Full lifecycle involvement could significantly boost your compensation potential."
    ],
    limited: [
      "Your project experience shows potential. Expanding across more lifecycle phases could substantially increase your market value.",
      "Consider seeking opportunities to engage in complete project lifecycles - it's a key factor in salary negotiations.",
      "Building broader project lifecycle experience could be your pathway to higher compensation brackets."
    ]
  },

  communication: {
    excellent: [
      "Outstanding communication skills! This soft skill significantly amplifies your technical value in the market.",
      "Exceptional communication abilities! Your presentation and writing skills are major salary boosters.",
      "Impressive communication profile! This combination with technical skills puts you in premium salary ranges."
    ],
    good: [
      "Good communication skills! Consider enhancing your presentation abilities to maximize your market potential.",
      "Solid communication foundation. Strengthening your written and verbal skills could increase your salary prospects.",
      "Your communication skills are developing well. Advanced communication training could unlock higher pay scales."
    ],
    needsImprovement: [
      "Your technical skills are strong, but improving communication could significantly boost your salary potential.",
      "Consider investing in communication skill development - it's often the difference between good and great salaries.",
      "Strong technical foundation! Enhanced communication skills could be your key to accessing premium salary brackets."
    ]
  },

  awards: {
    multiple: [
      "Impressive recognition portfolio! Your awards and certifications demonstrate excellence that commands premium salaries.",
      "Outstanding achievement record! Your certifications and awards significantly enhance your market value.",
      "Excellent recognition profile! These achievements position you for top-tier compensation packages."
    ],
    some: [
      "Good recognition! Your certifications show commitment to excellence. Consider pursuing additional industry awards.",
      "Nice achievement portfolio! Additional certifications could further strengthen your salary negotiation position.",
      "Your awards demonstrate quality work. More industry recognition could unlock even higher salary ranges."
    ],
    few: [
      "Consider pursuing relevant certifications and industry recognition to boost your market value significantly.",
      "Building a portfolio of certifications and achievements could substantially increase your salary potential.",
      "Industry certifications and awards could be game-changers for your compensation negotiations."
    ]
  },

  international: {
    extensive: [
      "Exceptional global exposure! Your international experience is highly valued and commands premium salaries.",
      "Outstanding international profile! Global experience significantly increases your market value across industries.",
      "Impressive worldwide exposure! This international perspective makes you extremely valuable to global companies."
    ],
    moderate: [
      "Good international exposure! Consider expanding your global experience to access higher salary brackets.",
      "Your international experience is valuable. More global exposure could unlock premium compensation packages.",
      "Nice global perspective! Additional international experience could significantly boost your market value."
    ],
    limited: [
      "Building international exposure could substantially increase your salary potential in today's global market.",
      "Consider seeking international projects or collaborations - global experience is a major salary differentiator.",
      "International exposure could be your pathway to accessing premium salary ranges in multinational companies."
    ]
  },

  teamDiversity: {
    extensive: [
      "Excellent multicultural team experience! Your ability to work across diverse environments is highly valued.",
      "Outstanding diversity collaboration! This experience significantly enhances your value in global organizations.",
      "Impressive multicultural background! Your diverse team experience commands premium salaries in international markets."
    ],
    moderate: [
      "Good diverse team experience! Expanding your multicultural collaboration could increase your market value.",
      "Your diversity experience is solid. More multicultural exposure could unlock higher salary opportunities.",
      "Nice team diversity background! Additional multicultural experience could boost your compensation potential."
    ],
    limited: [
      "Building experience with diverse, multicultural teams could significantly increase your market value.",
      "Consider seeking opportunities in diverse environments - it's increasingly important for salary growth.",
      "Multicultural team experience could be key to accessing higher compensation in global companies."
    ]
  },

  innovation: {
    high: [
      "Exceptional innovation profile! Your patents and open source contributions command premium market salaries.",
      "Outstanding creative contributions! Your innovations significantly differentiate you in salary negotiations.",
      "Impressive innovation record! These contributions position you for top-tier compensation packages."
    ],
    moderate: [
      "Good innovation foundation! Consider increasing your open source contributions to boost your market value.",
      "Your creative work shows promise. More innovation projects could unlock higher salary brackets.",
      "Nice innovation start! Expanding your contribution portfolio could significantly increase your compensation potential."
    ],
    developing: [
      "Building your innovation portfolio through open source contributions could substantially increase your salary potential.",
      "Consider developing patents or unique algorithms - innovation is a major differentiator in compensation.",
      "Innovation contributions could be your pathway to accessing premium salary ranges in tech companies."
    ]
  },

  creativity: {
    high: [
      "Exceptional creativity! Your innovative thinking is a rare skill that commands premium salaries.",
      "Outstanding creative abilities! This mindset significantly enhances your value in problem-solving roles.",
      "Impressive creative profile! Your innovative approach positions you for top-tier compensation."
    ],
    moderate: [
      "Good creative foundation! Showcasing more innovative projects could increase your market value.",
      "Your creativity shows well. Highlighting more innovative solutions could unlock higher salary opportunities.",
      "Nice creative thinking! Expanding your innovation showcase could boost your compensation potential."
    ],
    developing: [
      "Developing your creative portfolio could significantly increase your market value in innovative companies.",
      "Consider highlighting more creative problem-solving examples - innovation drives salary premiums.",
      "Creative thinking skills could be your key to accessing higher compensation in forward-thinking organizations."
    ]
  },

  processes: {
    versatile: [
      "Excellent process adaptability! Your flexibility across methodologies significantly increases your market value.",
      "Outstanding process experience! Your versatility in different frameworks commands premium salaries.",
      "Impressive process knowledge! This adaptability positions you for top-tier compensation packages."
    ],
    moderate: [
      "Good process foundation! Expanding your methodology experience could unlock higher salary brackets.",
      "Your process knowledge is solid. More framework versatility could increase your compensation potential.",
      "Nice process background! Additional methodology experience could boost your market value significantly."
    ],
    limited: [
      "Building experience with diverse processes and methodologies could substantially increase your salary potential.",
      "Consider learning popular frameworks like Agile, DevOps - process skills are key salary differentiators.",
      "Process methodology expertise could be your pathway to accessing premium compensation packages."
    ]
  },

  technicalSkills: {
    cutting_edge: [
      "Outstanding technical skills! Your expertise in trending technologies commands premium market salaries.",
      "Exceptional tech stack! Your skills in high-demand technologies significantly boost your compensation potential.",
      "Impressive technical profile! These cutting-edge skills position you for top-tier salary ranges."
    ],
    current: [
      "Good technical foundation! Consider adding more trending technologies to maximize your market value.",
      "Your tech skills are solid. Expanding into emerging technologies could unlock higher salary brackets.",
      "Nice technical base! Additional modern tech skills could significantly increase your compensation potential."
    ],
    outdated: [
      "Your experience is valuable, but updating your technical skills could substantially increase your salary potential.",
      "Consider learning modern technologies - staying current is crucial for accessing higher compensation ranges.",
      "Skill modernization could be your key to unlocking premium salary opportunities in today's market."
    ]
  },

  architecture: {
    expert: [
      "Exceptional design and architecture skills! This expertise commands some of the highest salaries in tech.",
      "Outstanding architectural abilities! Your system design skills significantly enhance your market value.",
      "Impressive architecture profile! These skills position you for premium compensation packages."
    ],
    intermediate: [
      "Good architectural foundation! Expanding your design expertise could unlock higher salary opportunities.",
      "Your architecture skills show promise. Advanced design experience could boost your compensation potential.",
      "Nice architectural background! Deeper system design skills could significantly increase your market value."
    ],
    basic: [
      "Building stronger architecture and design skills could substantially increase your salary potential.",
      "Consider developing system design expertise - it's a major differentiator in compensation negotiations.",
      "Architectural skills could be your pathway to accessing premium salary ranges in senior roles."
    ]
  },

  techWisdom: {
    deep: [
      "Exceptional technology wisdom! Your deep understanding across platforms commands premium salaries.",
      "Outstanding tech insight! Your cross-technology expertise significantly enhances your market value.",
      "Impressive technology wisdom! This depth positions you for top-tier compensation packages."
    ],
    moderate: [
      "Good technology understanding! Deepening your cross-platform knowledge could increase your market value.",
      "Your tech wisdom is developing well. Broader technology exposure could unlock higher salary brackets.",
      "Nice technology foundation! Expanding your platform expertise could boost your compensation potential."
    ],
    developing: [
      "Building deeper technology wisdom across platforms could substantially increase your salary potential.",
      "Consider gaining experience with diverse technologies - breadth and depth drive salary premiums.",
      "Technology wisdom could be your key to accessing higher compensation in complex technical roles."
    ]
  },

  scale: {
    enterprise: [
      "Exceptional scale experience! Your enterprise-level expertise commands premium market salaries.",
      "Outstanding scalability background! Large-scale experience significantly enhances your compensation potential.",
      "Impressive scale profile! This enterprise experience positions you for top-tier salary ranges."
    ],
    medium: [
      "Good scale experience! Working on larger systems could unlock higher salary opportunities.",
      "Your scalability background is solid. Enterprise-level experience could boost your compensation potential.",
      "Nice scale foundation! Larger system experience could significantly increase your market value."
    ],
    small: [
      "Building experience with larger-scale systems could substantially increase your salary potential.",
      "Consider seeking opportunities in high-scale environments - it's a major salary differentiator.",
      "Large-scale experience could be your pathway to accessing premium compensation packages."
    ]
  },

  management: {
    strong: [
      "Excellent management capabilities! Your leadership skills significantly amplify your technical value.",
      "Outstanding leadership profile! Management skills combined with technical expertise command premium salaries.",
      "Impressive management abilities! This leadership experience positions you for top-tier compensation."
    ],
    developing: [
      "Good management foundation! Expanding your leadership experience could unlock higher salary brackets.",
      "Your leadership skills show promise. More management experience could boost your compensation potential.",
      "Nice management start! Stronger leadership skills could significantly increase your market value."
    ],
    limited: [
      "Developing management and leadership skills could substantially increase your salary potential.",
      "Consider seeking leadership opportunities - management skills are major salary differentiators.",
      "Leadership capabilities could be your key to accessing premium compensation in senior roles."
    ]
  },

  businessAcumen: {
    strong: [
      "Exceptional business acumen! Your commercial understanding significantly enhances your technical value.",
      "Outstanding business sense! This combination with technical skills commands premium salaries.",
      "Impressive business profile! Your commercial awareness positions you for top-tier compensation packages."
    ],
    moderate: [
      "Good business understanding! Strengthening your commercial acumen could increase your market value.",
      "Your business sense is developing. Enhanced commercial awareness could unlock higher salary opportunities.",
      "Nice business foundation! Deeper commercial understanding could boost your compensation potential."
    ],
    developing: [
      "Building stronger business acumen could substantially increase your salary potential in commercial roles.",
      "Consider developing commercial awareness - business skills are increasingly important for salary growth.",
      "Business acumen could be your pathway to accessing premium compensation in strategic positions."
    ]
  },

  domainExpertise: {
    deep: [
      "Exceptional domain expertise! Your specialized knowledge commands premium salaries in your industry.",
      "Outstanding domain mastery! This deep expertise significantly enhances your market value.",
      "Impressive domain profile! Your specialized knowledge positions you for top-tier compensation."
    ],
    moderate: [
      "Good domain knowledge! Deepening your industry expertise could unlock higher salary opportunities.",
      "Your domain understanding is solid. Specialized expertise could boost your compensation potential.",
      "Nice domain foundation! Deeper industry knowledge could significantly increase your market value."
    ],
    broad: [
      "Your broad experience is valuable! Consider developing deeper domain expertise for salary premiums.",
      "Building specialized domain knowledge could substantially increase your compensation potential.",
      "Domain expertise could be your key to accessing premium salaries in specialized industries."
    ]
  },

  technicalProwess: {
    exceptional: [
      "Outstanding technical prowess! Your advanced skills command some of the highest salaries in the market.",
      "Exceptional technical mastery! Your expertise significantly differentiates you in compensation negotiations.",
      "Impressive technical excellence! This prowess positions you for premium salary packages."
    ],
    strong: [
      "Strong technical abilities! Continuing to advance your skills could unlock even higher salary brackets.",
      "Your technical prowess is impressive. Cutting-edge skill development could boost your compensation further.",
      "Excellent technical foundation! Advanced specialization could significantly increase your market value."
    ],
    developing: [
      "Building stronger technical prowess could substantially increase your salary potential.",
      "Consider advancing your technical skills - mastery is a major differentiator in compensation.",
      "Technical excellence could be your pathway to accessing premium salary ranges."
    ]
  },

  companyType: {
    strategic: [
      "Excellent company choices! Your experience in high-growth sectors positions you for premium salaries.",
      "Outstanding market positioning! Your company background significantly enhances your compensation potential.",
      "Impressive company profile! This strategic experience commands higher salary ranges."
    ],
    stable: [
      "Good company experience! Consider exposure to high-growth sectors to maximize your market value.",
      "Your company background is solid. Startup or scale-up experience could unlock higher salary opportunities.",
      "Nice company foundation! Diverse company experience could boost your compensation potential."
    ],
    traditional: [
      "Your experience is valuable! Exposure to modern, fast-growing companies could increase your salary potential.",
      "Consider gaining experience in innovative companies - it's increasingly important for salary growth.",
      "Modern company experience could be your key to accessing higher compensation ranges."
    ]
  },

  roleCapability: {
    versatile: [
      "Exceptional role versatility! Your ability to play multiple roles significantly increases your market value.",
      "Outstanding role flexibility! This adaptability commands premium salaries in dynamic organizations.",
      "Impressive role capability! Your versatility positions you for top-tier compensation packages."
    ],
    focused: [
      "Strong role focus! Consider expanding your capability range to unlock higher salary opportunities.",
      "Your role expertise is deep. Broader capabilities could increase your compensation potential.",
      "Excellent specialization! Additional role flexibility could boost your market value significantly."
    ],
    narrow: [
      "Building broader role capabilities could substantially increase your salary potential.",
      "Consider expanding your role range - versatility is a major salary differentiator in modern organizations.",
      "Role diversification could be your pathway to accessing premium compensation packages."
    ]
  }
};

// Helper function to get random message from category
function getRandomMessage(category, level) {
  const messages = cvFeedbackMessages[category][level];
  return messages[Math.floor(Math.random() * messages.length)];
}

// Function to generate contextual feedback based on analysis
function generateCVFeedback(analysisResults) {
  const feedback = [];
  
  // Map analysis results to feedback messages
  Object.keys(analysisResults).forEach(category => {
    const level = analysisResults[category];
    if (cvFeedbackMessages[category] && cvFeedbackMessages[category][level]) {
      feedback.push({
        category: category,
        level: level,
        message: getRandomMessage(category, level),
        impact: getImpactLevel(level)
      });
    }
  });
  
  return feedback;
}

// Helper function to determine impact level
function getImpactLevel(level) {
  switch(level) {
    case 'excellent':
    case 'exceptional':
    case 'outstanding':
    case 'high':
    case 'strong':
    case 'deep':
    case 'extensive':
    case 'expert':
    case 'versatile':
    case 'strategic':
    case 'cutting_edge':
    case 'enterprise':
    case 'comprehensive':
    case 'multiple':
      return 'positive';
    case 'good':
    case 'moderate':
    case 'current':
    case 'intermediate':
    case 'medium':
    case 'some':
    case 'partial':
    case 'stable':
    case 'focused':
      return 'neutral';
    case 'needsImprovement':
    case 'developing':
    case 'limited':
    case 'few':
    case 'basic':
    case 'outdated':
    case 'small':
    case 'narrow':
    case 'traditional':
    case 'broad':
    case 'emerging':
      return 'improvement';
    default:
      return 'neutral';
  }
}

module.exports = {
  cvFeedbackMessages,
  generateCVFeedback,
  getRandomMessage
};