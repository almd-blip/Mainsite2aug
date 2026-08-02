/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { AppConfig, AccessibilitySettings } from '../types';
import { 
  Home, HelpCircle, Heart, Compass, Layers, ChevronDown, ChevronRight, ChevronUp,
  PanelLeftClose, PanelLeftOpen, Search, Sparkles, BookOpen, Wind, Download, ExternalLink,
  Check, ArrowRight, ArrowLeft, Shield, Lightbulb, Feather, Brain, FileText, Menu, X, RotateCcw,
  Sliders, MessageSquare, Target, Eye, Globe, UserCheck, Scale, RefreshCw, Zap,
  Camera, Plus, Minus
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import PracticeEngine from './PracticeEngine';
import PauseAndBreatheMenu from './PauseAndBreatheMenu';
import { ResearchInsight } from './ResearchInsight';
import TrustFooter from './TrustFooter';
import { EcosystemMap } from './EcosystemMap';
import { useCmsText } from '../cms/CmsContentProvider';

export const BURGUNDY = '#912A4A';
export const INDIGO = '#1B0A3B';

// Default homepage hero image, shown to all visitors until they upload their own.
// Source: Performance installation at Ramsay Art Prize, Art Gallery of South Australia.
const DEFAULT_HERO_IMAGE = '/homepage_hero.jpg';

/**
 * Renders long-form second-layer body text (framework sections, ecosystem
 * pages, etc.) as separate paragraphs with doubled spacing between them —
 * 2em, versus the single ~1em gap a plain blank line would give — to reduce
 * cognitive load on dense reference pages. Internal single line breaks
 * (e.g. list-style lines within one paragraph) are preserved as-is.
 * Only paragraph spacing changes; callers still control text size, color,
 * and opacity via textClassName.
 */
const renderLongFormBody = (body: string, textClassName: string) => (
  <div className="space-y-[2em]">
    {body.split(/\n{2,}/).map((paragraph, idx) => (
      <p key={idx} className={`whitespace-pre-line ${textClassName}`}>
        {paragraph}
      </p>
    ))}
  </div>
);

/**
 * Content for the "Research Insight" boxes shown on select pages: a quote,
 * a short explanatory paragraph connecting it to Second Thought's practice,
 * and a Harvard-style source citation.
 */
const RESEARCH_INSIGHTS: Record<string, { quote: string; paragraph: string; source: string }> = {
  pauseAndBreathe: {
    quote: '"Mindfulness helps people respond to experiences with greater awareness rather than reacting automatically."',
    paragraph:
      'Pause and Breathe creates a moment of choice — allowing space to observe thoughts, regulate emotions, and respond with greater care.',
    source:
      'Bishop, S. R., et al. (2004). Mindfulness: A proposed operational definition. Clinical Psychology: Science and Practice, 11(3), 230–241.'
  },
  practiceEngine: {
    quote: '"Cognitive reappraisal is one of the most effective emotion regulation strategies."',
    paragraph: 'Reconsidering how we interpret a situation can support more thoughtful responses.',
    source: 'Gross, J. J. (2015). Emotion Regulation: Current Status and Future Prospects. Psychological Inquiry, 26(1), 1–26.'
  },
  framework: {
    quote: '"Reconsidering our first interpretation of an experience can open the possibility of a different response."',
    paragraph:
      'The Second Thought Framework invites people to move beyond automatic reactions and explore what becomes possible when we approach ourselves and others with curiosity.',
    source:
      'Kross, E., Ayduk, O., & Mischel, W. (2005). When asking "why" does not hurt: Distinguishing rumination from reflective processing of negative emotions. Psychological Science, 16(9), 709–715.'
  },
  'ip-apps': {
    quote: '"The most profound technologies are those that disappear into the background of our lives."',
    paragraph:
      'Second Thought apps are designed as calm, supportive tools that respect attention and autonomy. By prioritising simplicity and offline access, they create space for reflection without adding to digital noise.',
    source:
      'Weiser, M., & Brown, J. S. (1997). The Coming Age of Calm Technology. In P. J. Denning & R. M. Metcalfe (Eds.), Beyond Calculation: The Next Fifty Years of Computing. Springer-Verlag.'
  },
  'ip-publications': {
    quote: '"Small reflective practices can help people develop greater self-awareness and emotional understanding."',
    paragraph:
      'Second Thought Guided Journals bring reflective practice into everyday life, offering gentle prompts that help people notice patterns, explore possibilities, and reconnect with themselves.',
    source:
      "Sutton, A. (2016). Measuring the Effects of Self-Awareness: Construction of the Self-Awareness Outcomes Questionnaire. Europe's Journal of Psychology."
  }
};

interface SecondThoughtWebsiteProps {
  activeApp: AppConfig;
  fontSize: 'standard' | 'large' | 'extra-large';
  settings?: AccessibilitySettings;
  onSettingsChange?: (settings: AccessibilitySettings) => void;
  onSelectApp?: (appId: string) => void;
  initialCategory?: string;
  onNavigateToTab?: (tab: 'wellbeing' | 'about' | 'workspace' | 'accessibility') => void;
  playTick?: (freq: number, dur?: number) => void;
}

export interface WebsiteResource {
  id: string;
  title: string;
  type: 'guide' | 'tool' | 'download' | 'workspace';
  description: string;
  actionText: string;
  contentSnippet?: string;
  actionHandlerType: 'download_txt' | 'switch_app' | 'open_modal' | 'open_wellbeing' | 'open_accessibility';
  targetId?: string;
}

export interface NavSubItemData {
  id: string;
  title: string;
  badge?: string;
  layer1: {
    headline: string;
    orientation: string;
  };
  layer2: {
    title: string;
    sections: {
      heading: string;
      body: string;
    }[];
    quote?: string;
  };
  layer3: {
    summary: string;
    resources: WebsiteResource[];
  };
}

export interface NavCategoryData {
  id: string;
  title: string;
  icon: React.ElementType;
  badge?: string;
  summary: string;
  subItems?: NavSubItemData[];
}

export const WEBSITE_NAV_HIERARCHY: NavCategoryData[] = [
  {
    id: 'home',
    title: 'Explore',
    icon: Home,
    badge: 'Welcome',
    summary: 'An accessible knowledge space and reflective orientation.',
    subItems: []
  },
  {
    id: 'pause-and-breathe',
    title: 'Pause and Breathe',
    icon: Wind,
    badge: 'Somatic',
    summary: 'Somatic micro-pauses, guided breathing, and grounding tools to settle your nervous system.',
    subItems: []
  },
  {
    id: 'what-is-second-thought',
    title: 'What is Second Thought?',
    icon: HelpCircle,
    badge: 'About',
    summary: 'What Second Thought is, what informs Second Thought, our purpose, who it is for, why it matters, and what guides us.',
    subItems: [
      {
        id: 'st-what-is-it',
        title: 'What Second Thought is',
        badge: '',
        layer1: {
          headline: 'What Second Thought is',
          orientation: 'Second Thought is a practice that encourages reflection and curiosity before action, honouring human dignity.',
        },
        layer2: {
          title: 'What Second Thought is',
          sections: [
            {
              heading: '',
              body: 'It encourages pausing, questioning, and responding with wisdom and compassion.'
            },
            {
              heading: '',
              body: 'Like many people, we at Second Thought have reacted from fear, misunderstood situations, carried stories that later turned out to be incomplete.\n\nWe have learned that wisdom rarely emerges from certainty; it grows through careful consideration and openness.'
            },
            {
              heading: '',
              body: 'Second Thought is centred on the principle that human dignity is intrinsic and undeniable.\n\nWe believe every person possesses inherent worth and the capacity for awareness, growth, and compassion. Therefore, people are more than their actions or the stories told about them.'
            }
          ]
        },
        layer3: { summary: '', resources: [] }
      },
      {
        id: 'st-framework',
        title: 'The Second Thought Framework',
        badge: '',
        layer1: {
          headline: 'The Second Thought Framework',
          orientation: 'The Second Thought Framework is a reflective practice for individuals, organisations, communities, and systems.',
        },
        layer2: {
          title: 'The Second Thought Framework',
          sections: [
            {
              heading: 'Look',
              body: 'Notice → What am I seeing? What am I feeling? What assumptions am I making?\n\nPause → Create space before reacting. Allow the story to slow. Notice automatic responses before they shape your actions.'
            },
            {
              heading: 'Ask',
              body: 'Question → What else might be true? What information am I missing? Who benefits from this interpretation?\n\nListen → Listen to yourself. Listen to others. Listen for experiences that challenge certainty.'
            },
            {
              heading: 'Think a Second Time',
              body: 'Reconsider → How might my understanding change? What becomes visible when I widen the frame?\n\nChoose → What response serves truth and reverence for life?'
            },
            {
              heading: 'Practice & Repetition',
              body: 'Like any practice, it becomes meaningful through repetition: noticing, pausing, questioning, listening, reconsidering, and choosing again.'
            },
            {
              heading: 'Applications',
              body: 'Personal growth, relationships, leadership, community cohesion, inclusion, education, cultural engagement, conflict resolution, responsible artificial intelligence, governance, public dialogue.'
            }
          ]
        },
        layer3: { summary: '', resources: [] }
      },
      {
        id: 'st-who-is-it-for',
        title: 'Who is Second Thought for?',
        badge: '',
        layer1: {
          headline: 'Who is Second Thought for?',
          orientation: 'Everyone is welcome. Second Thought is for anyone who wants to create more space between experience and response - to pause, reflect and deepen their understanding.',
        },
        layer2: {
          title: 'Who is Second Thought for?',
          sections: []
        },
        layer3: { summary: '', resources: [] }
      },
      {
        id: 'st-our-purpose',
        title: 'What is Our Purpose?',
        badge: '',
        layer1: {
          headline: 'What is Our Purpose?',
          orientation: 'It is not to tell people what to think. It is to encourage better thinking.\n\nThe consideration that if people are more than their worst moment, then compassion and accountability can coexist.',
        },
        layer2: {
          title: 'What is Our Purpose?',
          sections: [
            {
              heading: '',
              body: 'Second Thought begins with a simple observation:\n\nAn event happens.\nA story follows.\nThe story is not always the same as the event.\nBetween those two things lies a space.\n\nThe practice of Second Thought is anchored on the idea that multiple truths can coexist, and that no one can be accurately defined by their best or worst moments.\nThat space is where awareness lives. It is where compassion becomes possible.\nIt is where wisdom can emerge.'
            },
            {
              heading: '',
              body: 'Second Thought is an invitation to think together. To question our assumptions. To wonder. To recognise reality is not linear.\n\nThis does not remove accountability. It means remaining compassionate without abandoning truth. It does not deny harm. It does not ignore injustice. Rather, it asks us to hold truth and humanity together.\n\nSome truths can be verified through evidence, history, science, and lived reality. Others are shaped by perspective, memory, relationships, power, and context.\n\nSecond Thought therefore approaches situations with curiosity, humility, and care for each other. Not because all claims are equally valid, but because certainty without reflection can easily become dehumanisation.\n\nWhen we pause long enough to create awareness and clarity, compassion may become a more natural response. It does not require agreement, it does not remove boundaries, it does not excuse harm. Compassion simply refuses to forget our shared humanity.\n\nWe hope Second Thought can help create the conditions in which better thinking becomes possible. To encourage curiosity, understanding, humanity where there is dehumanisation. And to ask, in every situation: What response serves truth and reverence for life?'
            }
          ]
        },
        layer3: {
          summary: 'Purpose statement document.',
          resources: [
            {
              id: 'res-st-purpose-doc',
              title: 'Purpose Statement Document',
              type: 'guide',
              description: 'Core purpose and vision of Second Thought.',
              actionText: 'Download purpose doc (.txt)',
              actionHandlerType: 'download_txt',
              contentSnippet: `The purpose of Second Thought — what do we want to achieve?
--------------------------------------------------
It is not to tell people what to think. It is to encourage better thinking.
The consideration that if people are more than their worst moment, then compassion and accountability can coexist.`
            }
          ]
        }
      },
      {
        id: 'st-what-guides-us',
        title: 'What guides us?',
        badge: '',
        layer1: {
          headline: 'What guides us?',
          orientation: 'Second Thought holds close seven ethical, non-negotiable commitments that guide all aspects of our activity.',
        },
        layer2: {
          title: 'What guides us?',
          sections: [
            {
              heading: '',
              body: 'Reflection: Creating space for deeper thinking before reaction.\nCompassion: Recognising the humanity in ourselves and others.\nCuriosity: Approaching complexity with openness rather than certainty.\nInclusion: Making space for many voices, experiences, and perspectives.\nWisdom: Balancing truth, accountability, context, and humanity.\nAccessibility: Designing resources that welcome everyone.\nHuman Dignity: Recognising the inherent, unconditional worth of every person.'
            }
          ]
        },
        layer3: { summary: '', resources: [] }
      },
      {
        id: 'st-what-informs-us',
        title: 'What informs Second Thought?',
        badge: '',
        layer1: {
          headline: 'What informs Second Thought?',
          orientation: 'Second Thought is informed by lived experience, research and work in the cultural sector.',
        },
        layer2: {
          title: 'What informs Second Thought?',
          sections: [
            {
              heading: '',
              body: 'It responds to the growing pressures of a society increasingly mediated by technology, including misinformation, manipulated media, deepfakes, polarisation, online harassment and social exclusion.'
            }
          ]
        },
        layer3: { summary: '', resources: [] }
      },
      {
        id: 'st-conversation-other-perspectives',
        title: 'Second Thought in Conversation With Other Perspectives',
        badge: '',
        layer1: {
          headline: 'Second Thought in Conversation With Other Perspectives',
          orientation: 'Second Thought is not presented as a replacement for existing theories, philosophies, or disciplines.',
        },
        layer2: {
          title: 'Second Thought  seeks to contribute to an ongoing conversation about how human beings understand themselves, one another, and the world around them.',
          sections: [
            {
              heading: 'Critical Thinking',
              body: `Second Thought shares critical thinking's commitment to questioning assumptions, examining evidence, and resisting simplistic conclusions. However, it extends critical thinking inward, encouraging us to examine our own interpretations, emotional reactions, and the stories we create about events and people.`
            },
            {
              heading: 'Brené Brown: Shame and Vulnerability',
              body: 'Second Thought aligns with the distinction between behaviour and identity. A mistake, failure, or harmful act should not become a permanent definition of a person. Vulnerability, courage, accountability, and growth remain possible when people are not reduced to labels.'
            },
            {
              heading: 'Humanistic and Participatory Traditions',
              body: 'Like humanistic psychology, participation, and community engagement practice, Second Thought begins with the assumption that people possess dignity, worth, and potential. It emphasises belonging, agency, listening, and the importance of creating conditions in which people can flourish.'
            },
            {
              heading: 'Ubuntu and Relational Philosophies',
              body: 'Second Thought resonates with traditions such as Ubuntu that recognise our interconnectedness. Awareness allows us to see ourselves in others and others in ourselves. From that recognition can emerge compassion, responsibility, and a deeper sense of shared humanity.'
            },
            {
              heading: 'Mindfulness and Awareness-Based Traditions',
              body: 'Second Thought shares an interest in awareness, presence, and observing thoughts without immediately identifying with them. It places particular emphasis on creating space between an event and our interpretation of it so that truth, compassion, and wisdom can emerge.'
            },
            {
              heading: 'Restorative and Transformative Approaches',
              body: 'Rather than asking only who is right or wrong, Second Thought is interested in understanding impact, context, accountability, repair, and the restoration of human dignity wherever possible.'
            },
            {
              heading: 'Human-Centred Artificial Intelligence and Ethics',
              body: 'Second Thought contributes a humanisation perspective to conversations about technology. It asks how systems, institutions, and Artificial Intelligence can recognise human complexity rather than reducing people to labels, categories, predictions, or assumptions.'
            },
            {
              heading: 'A Distinctive Contribution',
              body: `The distinctive contribution of Second Thought is its emphasis on the relationship between awareness, interpretation, and humanisation.

It proposes that much conflict, suffering, prejudice, exclusion, and manipulation arise when people mistake interpretations for reality, stories for facts, or behaviour for identity.

Its central practice is simple:

Create enough space between an event and its interpretation that awareness, compassion, truth, and wisdom can emerge.`
            }
          ]
        },
        layer3: { summary: '', resources: [] }
      },
      {
        id: 'st-why-it-matters',
        title: 'Why does Second Thought matter?',
        badge: '',
        layer1: {
          headline: 'Why does Second Thought matter?',
          orientation: 'It matters because, in a complex society, online narratives, labels, algorithms, and polarisation make it easier than ever to reduce people to a single narrative.',
        },
        layer2: {
          title: 'Why does Second Thought matter?',
          sections: [
            {
              heading: 'Technology has changed the speed of stories',
              body: 'We live in a time of extraordinary connection and unprecedented complexity. Information travels faster than ever before. The challenges we face are not only technological. They are deeply human.'
            },
            {
              heading: 'Information is not always understanding',
              body: 'Artificial intelligence can generate persuasive text, images, audio, and video within seconds. Artificial intelligence hallucinations, deepfakes and manipulated content can blur the boundary between fact and fiction. Social media can amplify stories across the world before they have been verified.'
            },
            {
              heading: 'People can become reduced to narratives',
              body: 'Public conversations are often shaped by speed rather than deliberation, certainty rather than curiosity, and reaction rather than understanding. Communities can form around shared ideas, but also around fear, outrage, and certainty. People can find themselves reduced to one story...\n\nAt the same time, many people are experiencing increasing loneliness, division, mistrust, and disconnection. Second Thought creates space for another possibility: approaching complexity with curiosity, humility, and care.'
            },
            {
              heading: 'Complexity requires reflection',
              body: 'Across workplaces, institutions, communities, and digital spaces, individuals may experience exclusion, scapegoating, ostracisation, reputational harm, groupthink, or the pressure to conform. Nuance is often lost. Complexity becomes uncomfortable.\n\nYet these patterns are not new. History repeatedly shows the consequences of dehumanisation, fear, and the failure to recognise our shared humanity.\n\nBut we can choose a different path. Second Thought exists because these challenges cannot be solved by technology alone. They require deliberate thought. They require compassion.\n\nThey require the courage to question our assumptions, examine our stories, and remain open to the possibility that our first interpretation may not be the whole truth.'
            },
            {
              heading: 'Humanity and accountability can coexist',
              body: 'This does not mean abandoning evidence, accountability, or justice. It does not mean accepting every claim as equally valid. It means recognising that wisdom requires both discernment and humility.\n\nThe future will be shaped not just by technology but how we choose to use it to see one another.'
            }
          ]
        },
        layer3: { summary: '', resources: [] }
      }
    ]
  },
  {
    id: 'ready',
    title: 'I’m ready',
    icon: Sparkles,
    badge: 'Ready',
    summary: 'Choose where to begin putting Second Thought into practice.',
    subItems: []
  },
  {
    id: 'how-do-i-begin',
    title: 'How do I begin?',
    icon: Compass,
    badge: 'Begin',
    summary: 'Create space in between an event and your choice of response.',
    subItems: [
      {
        id: 'hdib-create-space',
        title: 'Create space',
        badge: 'Pause',
        layer1: {
          headline: 'Create space',
          orientation: 'Create space in between an event and your choice of response.',
        },
        layer2: {
          title: 'Create space',
          sections: [
            {
              heading: 'Create space',
              body: 'Create space in between an event and your choice of response.'
            }
          ]
        },
        layer3: { summary: '', resources: [] }
      },
      {
        id: 'hdib-practice-engine',
        title: 'The Second Thought Practice Engine',
        badge: 'Interactive',
        layer1: {
          headline: 'The Second Thought Practice Engine',
          orientation: 'Use our Practice Engine, a tool enhanced by artificial intelligence.',
        },
        layer2: {
          title: 'The Second Thought Practice Engine',
          sections: [
            {
              heading: 'The Second Thought Practice Engine',
              body: 'This Engine supports Noticing what is happening, Pausing before reacting, Questioning what stories you might carry, Listening with curiosity, Reconsidering what might be possible, Choosing your response with positive intention.'
            }
          ]
        },
        layer3: {
          summary: 'Launch the embedded Practice Engine directly.',
          resources: [
            {
              id: 'res-hdib-engine-launch',
              title: 'Practice Engine Tool',
              type: 'tool',
              description: 'Interactive reflection tool supported by artificial intelligence on-device.',
              actionText: 'Launch Practice Engine',
              actionHandlerType: 'open_wellbeing'
            }
          ]
        }
      }
    ]
  },
  {
    id: 'in-practice',
    title: 'The Second Thought Ecosystem',
    icon: Layers,
    badge: 'Ecosystem',
    summary: 'The Second Thought Ecosystem is built on:',
    subItems: [
      {
        id: 'ip-framework',
        title: 'Practice – the Second Thought Framework',
        badge: 'Framework',
        layer1: {
          headline: 'Practice – the Second Thought Framework',
          orientation: 'The Second Thought Framework is a reflective practice for individuals, organisations, communities, and systems.',
        },
        layer2: {
          title: 'What the Second Thought Framework means',
          sections: [
            {
              heading: 'Look',
              body: 'Notice → What am I seeing? What am I feeling? What assumptions am I making?\n\nPause → Create space before reacting. Allow the story to slow. Notice automatic responses before they shape your actions.'
            },
            {
              heading: 'Ask',
              body: 'Question → What else might be true? What information am I missing? Who benefits from this interpretation?\n\nListen → Listen to yourself. Listen to others. Listen for experiences that challenge certainty.'
            },
            {
              heading: 'Think a Second Time',
              body: 'Reconsider → How might my understanding change? What becomes visible when I widen the frame?\n\nChoose → What response serves truth and reverence for life?'
            },
            {
              heading: 'Practice & Repetition',
              body: 'Like any practice, it becomes meaningful through repetition: noticing, pausing, questioning, listening, reconsidering, and choosing again.'
            },
            {
              heading: 'Applications',
              body: 'Personal growth, relationships, leadership, community cohesion, inclusion, education, cultural engagement, conflict resolution, responsible artificial intelligence, governance, public dialogue.'
            }
          ]
        },
        layer3: {
          summary: 'Framework reference sheets.',
          resources: [
            {
              id: 'res-ip-fw-sheet',
              title: 'Second Thought Framework Guide',
              type: 'download',
              description: 'Complete 6-step reflective framework guide.',
              actionText: 'Download framework guide (.txt)',
              actionHandlerType: 'download_txt',
              contentSnippet: `The Second Thought framework
--------------------------------------------------
Look:
• Notice → What am I seeing? What am I feeling? What assumptions am I making?
• Pause → Create space before reacting. Allow the story to slow. Notice automatic responses before they shape your actions.

Ask:
• Question → What else might be true? What information am I missing? Who benefits from this interpretation?
• Listen → Listen to yourself. Listen to others. Listen for experiences that challenge certainty.

Think a second time:
• Reconsider → How might my understanding change? What becomes visible when I widen the frame?
• Choose → What response serves truth and reverence for life?`
            }
          ]
        }
      },
      {
        id: 'ip-apps',
        title: 'Apps – digital tools',
        badge: 'Apps',
        layer1: {
          headline: 'Apps – digital tools',
          orientation: 'Second Thought apps are supportive digital tools designed to help people reconnect with themselves while navigating the demands of work and everyday life.',
        },
        layer2: {
          title: 'What are Second Thought apps?',
          sections: [
            {
              heading: 'What are Second Thought apps?',
              body: 'The Second Thought apps bring the principles of the Second Thought Framework into everyday practice through calm, accessible and privacy-conscious digital tools.\n\nOur apps are offline-first, Calm by design, accessible and inclusive digital tools. They are designed to support your work and everyday life while helping you protect your wellbeing and, wherever possible, your privacy.'
            },
            {
              heading: 'Current and planned app concepts:',
              body: 'Second Thought Companion\nCreates a schedule that adapts to your mood and energy levels, with an enhanced by artificial intelligence Second Thought Practice Engine that responds to your context.\n\nHarbour\nHelps organise sensitive or complex information in a calm and structured way.\n\nResearch Companion\nSupports research activities while helping you stay focused and organised.\n\nSelf-publishing Friend\nGuides self-publishing authors through editing and quality assurance workflows aligned with Kindle Direct Publishing guidelines.\n\nBorn Wide (Welcoming, Inclusive and Accessible, Diverse and Equitable)\nSupports content creators and designers to create work that is Welcoming, Inclusive and Accessible, Diverse and Equitable by design.\n\nSecond Thought apps will continue to expand as needs arise.'
            },
            {
              heading: 'Shared Features:',
              body: 'Editable Calm sound and image libraries;\nMood check-in tools;\nBreathing and presence exercises;\nFocus timer;\nGratitude and affirmation tools;\nAndroid-friendly environment'
            },
            {
              heading: 'App principles:',
              body: 'Human-centred design\nCalm interface\nLow cognitive load\nClear hierarchy\nCustomisable accessibility settings\nUser-owned, exportable and importable data\nenhanced by artificial intelligence functionality\nFull offline functionality'
            },
            {
              heading: 'Why do they exist?',
              body: 'Second Thought apps are part of a vision to create human-centred, grounded and trustworthy tools that support greater control over personal data.\n\nThese apps have been developed in response to the pressures of hyperconnectivity and growing concerns about data privacy and security. We don\'t claim to solve these issues. Our apps propose a way to help manage them.\n\nThey also encourage self-compassion, curiosity and reflection practices aligned with the Second Thought Framework.'
            },
            {
              heading: 'Who are the apps for?',
              body: 'Second Thought apps are for anyone seeking a calmer, more compassionate and reflective way to navigate work and everyday life.'
            }
          ]
        },
        layer3: {
          summary: 'Direct application workspace launchers.',
          resources: [
            {
              id: 'res-ip-companion',
              title: 'Launch Second Thought Companion',
              type: 'workspace',
              description: 'Adaptive schedule, mood tracking, and Practice Engine.',
              actionText: 'Open Companion App',
              actionHandlerType: 'switch_app',
              targetId: 'companion'
            }
          ]
        }
      },
      {
        id: 'ip-publications',
        title: 'Publications – Reflective journals',
        badge: 'Journals',
        layer1: {
          headline: 'Publications – Reflective journals',
          orientation: 'Publications – Reflective journals',
        },
        layer2: {
          title: 'Still Becoming Series',
          sections: [
            {
              heading: 'Still Becoming Series',
              body: 'A series of reflective journals designed to help people reconnect with themselves. Not by becoming someone new, but by recognising who they already are beneath pressure, self-criticism, fear, expectations, and survival.'
            },
            {
              heading: 'Our Guided Journals include:',
              body: 'Guided prompts\nReflective spaces\nBreathing pauses\nPresence pages\nCalm and Accessibility conscious design'
            },
            {
              heading: 'Core beliefs:',
              body: 'You are not a problem to solve.\nYou are not a project to complete.\nYou are not behind.\nYou are not broken.\nYou are still becoming.'
            },
            {
              heading: 'Development Process',
              body: 'The journals are developed through a collaborative creative process involving the author, Claude Sonnet, and ChatGPT.\n\nThe intention of this collaboration is not to replace human reflection, judgement, or creativity, but to support them.\n\nArtificial intelligence tools are used as thought partners, developmental editors, accessibility reviewers, and publishing assistants throughout the creation of the manuscript.\n\nThe ideas, reflections, philosophy, editorial decisions, and final content remain the responsibility of the author and publisher.'
            },
            {
              heading: 'Guided Journal for Belonging, Self-Trust and Self-Discovery.',
              body: 'This journal invites readers to explore belonging, self-trust, compassion, resilience, reflection, identity, growth, possibility, and homecoming. Because home is not a location. It is a relationship with yourself. This journal is not an invitation to become enough or someone new. It is about returning home to the goodness, worth, and belonging that have always been yours.'
            }
          ]
        },
        layer3: {
          summary: 'Journal preview and Still Becoming workspace.',
          resources: [
            {
              id: 'res-ip-journal-app',
              title: 'Launch Still Becoming Workspace',
              type: 'workspace',
              description: 'Private journaling workspace with guided prompts.',
              actionText: 'Open Still Becoming App',
              actionHandlerType: 'switch_app',
              targetId: 'still-becoming'
            }
          ]
        }
      },
      {
        id: 'ip-research',
        title: 'Research – Deep in Thought',
        badge: 'Research',
        layer1: {
          headline: 'Research – Deep in Thought',
          orientation: 'Research – Deep in Thought',
        },
        layer2: {
          title: 'Research – Deep in Thought',
          sections: [
            {
              heading: 'Second Thought Research',
              body: 'Second Thought asks how research can help people see one another more clearly. We are interested in what technologies and institutions can do. We also study how they shape belonging, dignity, and trust.'
            },
            {
              heading: 'Current areas of interest:',
              body: 'Human-centred artificial intelligence\nAccessibility and inclusion\nParticipation and community voice\nCultural engagement\nDigital belonging\nCompassion in public life\nReflective practice\nCollective behaviour\nDehumanisation and humanisation\nWisdom-based approaches to decision making'
            },
            {
              heading: 'Human Flourishing & Dignity',
              body: 'Research is about more than generating knowledge. It is about understanding what helps people flourish. We want to create systems that recognise dignity, belonging, equitable participation, and humanity.'
            }
          ]
        },
        layer3: {
          summary: 'Research workspace and papers.',
          resources: [
            {
              id: 'res-ip-research-app',
              title: 'Launch Research Companion',
              type: 'workspace',
              description: 'Organize research projects, sources, and insights.',
              actionText: 'Open Research App',
              actionHandlerType: 'switch_app',
              targetId: 'research'
            }
          ]
        }
      }
    ]
  }
];

export const VALUES_LIST = [
  { id: 'val-reflection', name: 'Reflection', desc: 'Creating space for deeper thinking before reaction.', icon: Feather },
  { id: 'val-compassion', name: 'Compassion', desc: 'Recognising the humanity in ourselves and others.', icon: Heart },
  { id: 'val-curiosity', name: 'Curiosity', desc: 'Approaching complexity with openness rather than certainty.', icon: Lightbulb },
  { id: 'val-inclusion', name: 'Inclusion', desc: 'Making space for many voices, experiences, and perspectives.', icon: Globe },
  { id: 'val-wisdom', name: 'Wisdom', desc: 'Balancing truth, accountability, context, and humanity.', icon: BookOpen },
  { id: 'val-accessibility', name: 'Accessibility', desc: 'Designing resources that welcome everyone.', icon: Eye },
  { id: 'val-human-dignity', name: 'Human Dignity', desc: 'Recognising the inherent, unconditional worth of every person.', icon: Shield }
];

type CmsTextGetter = (key: string, fallback?: string) => string;

const applyCmsToNavHierarchy = (
  hierarchy: NavCategoryData[],
  cmsText: CmsTextGetter
): NavCategoryData[] => hierarchy.map((category) => ({
  ...category,
  title: cmsText(`nav.category.${category.id}.title`, category.title),
  summary: cmsText(`nav.category.${category.id}.summary`, category.summary),
  subItems: category.subItems?.map((subItem) => ({
    ...subItem,
    title: cmsText(`nav.subitem.${subItem.id}.title`, subItem.title),
    layer1: {
      ...subItem.layer1,
      headline: cmsText(`nav.subitem.${subItem.id}.headline`, subItem.layer1.headline),
      orientation: cmsText(`nav.subitem.${subItem.id}.orientation`, subItem.layer1.orientation)
    },
    layer2: {
      ...subItem.layer2,
      title: cmsText(`nav.subitem.${subItem.id}.layer2.title`, subItem.layer2.title),
      sections: subItem.layer2.sections.map((section, index) => ({
        ...section,
        heading: cmsText(`nav.subitem.${subItem.id}.section.${index}.heading`, section.heading),
        body: cmsText(`nav.subitem.${subItem.id}.section.${index}.body`, section.body)
      }))
    }
  }))
}));


export default function SecondThoughtWebsite({
  activeApp,
  fontSize,
  settings,
  onSettingsChange,
  onSelectApp,
  initialCategory,
  onNavigateToTab,
  playTick
}: SecondThoughtWebsiteProps) {
  const cmsText = useCmsText();
  const websiteNavHierarchy = useMemo(() => applyCmsToNavHierarchy(WEBSITE_NAV_HIERARCHY, cmsText), [cmsText]);

  const [isSidebarExpanded, setIsSidebarExpanded] = useState<boolean>(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  const [activeCategoryId, setActiveCategoryId] = useState<string>(initialCategory || 'home');
  const [activeSubItemId, setActiveSubItemId] = useState<string>('st-what-is-it');
  const [activeSubItemDetailId, setActiveSubItemDetailId] = useState<string | null>(null);

  const sidebarCategoryIds = websiteNavHierarchy.map((cat) => cat.id);
  const getSingleOpenCategoryState = (catId?: string): Record<string, boolean> => {
    const openCategoryId = catId && sidebarCategoryIds.includes(catId) ? catId : undefined;
    return Object.fromEntries(sidebarCategoryIds.map((id) => [id, id === openCategoryId]));
  };

  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>(() =>
    getSingleOpenCategoryState(initialCategory)
  );

  useEffect(() => {
    if (initialCategory) {
      setActiveCategoryId(initialCategory);
      setOpenCategories(getSingleOpenCategoryState(initialCategory));
    }
  }, [initialCategory]);

  // Track expanded cards state for progressive disclosure
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({
    'wim-tech-speed': true,
    'wim-info-understanding': false,
    'wim-reduction-narratives': false,
    'wim-complexity-reflection': false,
    'wim-humanity-accountability': false,
    'val-reflection': true,
    'val-compassion': false,
    'val-curiosity': false,
    'val-inclusion': false,
    'val-wisdom': false,
    'val-accessibility': false,
    'val-human-dignity': false,
    'hdib-space-between': true,
    'hdib-framework': false,
    'hdib-practice-engine': false
  });

  const [expandedWhySections, setExpandedWhySections] = useState<Record<number, boolean>>({
    0: false,
    1: false,
    2: false,
    3: false,
    4: false
  });

  const toggleWhySection = (idx: number) => {
    setExpandedWhySections(prev => ({
      ...prev,
      [idx]: !prev[idx]
    }));
    if (playTick) playTick(480, 0.05);
  };

  const [expandedConversationSections, setExpandedConversationSections] = useState<Record<number, boolean>>({
    0: false,
    1: false,
    2: false,
    3: false,
    4: false,
    5: false,
    6: false,
    7: false
  });

  const toggleConversationSection = (idx: number) => {
    setExpandedConversationSections(prev => ({
      ...prev,
      [idx]: !prev[idx]
    }));
    if (playTick) playTick(480, 0.05);
  };

  const [expandedFrameworkSections, setExpandedFrameworkSections] = useState<Record<number, boolean>>({
    0: false,
    1: false,
    2: false,
    3: false,
    4: false
  });

  const toggleFrameworkSection = (idx: number) => {
    setExpandedFrameworkSections(prev => ({
      ...prev,
      [idx]: !prev[idx]
    }));
    if (playTick) playTick(480, 0.05);
  };

  // Expand/collapse state for the Apps, Publications, and Research ecosystem
  // pages, keyed by `${subItemId}-${sectionIndex}` so each page's sections
  // track independently.
  const [expandedEcosystemSections, setExpandedEcosystemSections] = useState<Record<string, boolean>>({});

  const toggleEcosystemSection = (sectionKey: string) => {
    setExpandedEcosystemSections(prev => ({
      ...prev,
      [sectionKey]: !prev[sectionKey]
    }));
    if (playTick) playTick(480, 0.05);
  };

  const [sidebarSearch, setSidebarSearch] = useState<string>('');

  // Selected card inside How Do I Begin ('none' | 'pause' | 'engine')
  const [beginCardSelection, setBeginCardSelection] = useState<'none' | 'pause' | 'engine'>('none');

  const [isLayer2Expanded, setIsLayer2Expanded] = useState<boolean>(true);
  const [isLayer3Expanded, setIsLayer3Expanded] = useState<boolean>(false);

  const [downloadSuccessMessage, setDownloadSuccessMessage] = useState<string | null>(null);
  const [previewResource, setPreviewResource] = useState<WebsiteResource | null>(null);

  const [srLiveAnnounce, setSrLiveAnnounce] = useState<string>('Navigated to Home');

  const sidebarNavRef = useRef<HTMLElement | null>(null);
  const hasCompletedInitialNavigationRender = useRef(false);

  const activeCategory = websiteNavHierarchy.find(c => c.id === activeCategoryId) || websiteNavHierarchy[0];
  const activeSubItem = activeCategory.subItems?.find(s => s.id === activeSubItemId) || activeCategory.subItems?.[0];

  const getMainHeadingLabel = (): string => {
    const detailItem = activeSubItemDetailId
      ? websiteNavHierarchy.flatMap(c => c.subItems || []).find(s => s.id === activeSubItemDetailId)
      : undefined;

    if (detailItem) return detailItem.title;
    if (activeCategoryId === 'ready') return cmsText('ready.heading', 'I’m ready');
    if (activeCategoryId === 'home') return cmsText('nav.category.home.title', 'Explore');
    if (activeCategoryId === 'pause-and-breathe') return 'Pause and Breathe';
    if (activeCategoryId === 'how-do-i-begin') {
      if (beginCardSelection === 'engine') return 'The Second Thought Practice Engine';
      if (beginCardSelection === 'pause') return 'Create space';
      return cmsText('nav.category.how-do-i-begin.title', 'How do I begin?');
    }

    return activeCategory.title;
  };

  const scrollNavigationStartIntoView = () => {
    const target = document.getElementById('home-header') || document.getElementById('st-top-control-bar') || document.getElementById('st-content-main-panel');
    target?.scrollIntoView({ behavior: settings?.reducedMotion ? 'auto' : 'smooth', block: 'start' });

    const mainPanel = document.getElementById('st-content-main-panel') as HTMLElement | null;
    mainPanel?.focus({ preventScroll: true });
  };

  const navigateToReadyLanding = () => {
    setActiveCategoryId('ready');
    setActiveSubItemDetailId(null);
    setBeginCardSelection('none');
    setOpenCategories(getSingleOpenCategoryState('ready'));
    setSrLiveAnnounce('Navigated to I’m ready');
    if (playTick) playTick(520, 0.08);
  };

  const navigateToExploreLanding = () => {
    setActiveCategoryId('home');
    setActiveSubItemDetailId(null);
    setBeginCardSelection('none');
    setOpenCategories(getSingleOpenCategoryState('home'));
    setSrLiveAnnounce('Navigated to Explore');
    if (playTick) playTick(520, 0.08);
  };

  useEffect(() => {
    if (!hasCompletedInitialNavigationRender.current) {
      hasCompletedInitialNavigationRender.current = true;
      return;
    }

    const timer = window.setTimeout(scrollNavigationStartIntoView, 90);
    return () => window.clearTimeout(timer);
  }, [activeCategoryId, activeSubItemDetailId, beginCardSelection]);

  const textSpacingClass = fontSize === 'extra-large' ? 'tracking-wide text-lg' : fontSize === 'large' ? 'tracking-wide text-base' : 'tracking-normal text-sm';
  const headingSizeClass = fontSize === 'extra-large' ? 'text-2xl' : fontSize === 'large' ? 'text-xl' : 'text-lg';

  const toggleCategoryAccordion = (catId: string) => {
    setOpenCategories(prev => getSingleOpenCategoryState(prev[catId] ? undefined : catId));
    if (playTick) playTick(450, 0.04);
  };

  const toggleCardExpansion = (cardId: string) => {
    setExpandedCards(prev => ({
      ...prev,
      [cardId]: !prev[cardId]
    }));
    if (playTick) playTick(480, 0.05);
  };

  const handleEcosystemNodeSelect = (nodeId: string) => {
    if (playTick) playTick(520, 0.08);
    if (nodeId === 'ip-framework' || nodeId === 'ip-apps' || nodeId === 'ip-publications' || nodeId === 'ip-research') {
      setActiveCategoryId('in-practice');
      setOpenCategories(getSingleOpenCategoryState('in-practice'));
      setExpandedCards(prev => ({ ...prev, [nodeId]: true }));
      setTimeout(() => {
        const el = document.getElementById(`st-ip-card-${nodeId}`);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 120);
    } else if (nodeId === 'st-what-is-it') {
      setActiveCategoryId('what-is-second-thought');
      setOpenCategories(getSingleOpenCategoryState('what-is-second-thought'));
      setExpandedCards(prev => ({ ...prev, 'st-what-is-it': true }));
      setTimeout(() => {
        const el = document.getElementById('st-what-card-st-what-is-it');
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 120);
    }
  };

  const handleSelectNavSubItem = (catId: string, subItemId: string, subItemTitle: string) => {
    setActiveCategoryId(catId);
    setActiveSubItemId(subItemId);
    setActiveSubItemDetailId(subItemId);
    if (subItemId === 'hdib-pause-and-breathe' || subItemId === 'hdib-create-space') {
      setBeginCardSelection('pause');
    } else if (subItemId === 'hdib-practice-engine') {
      setBeginCardSelection('engine');
    } else {
      setBeginCardSelection('none');
    }
    setIsMobileMenuOpen(false);
    
    setOpenCategories(getSingleOpenCategoryState(catId));

    const categoryTitle = websiteNavHierarchy.find(c => c.id === catId)?.title || '';
    const announceMsg = `Navigated to ${categoryTitle} — ${subItemTitle}`;
    setSrLiveAnnounce(announceMsg);

    if (playTick) playTick(520, 0.05);
  };

  const handleResourceAction = (res: WebsiteResource) => {
    if (playTick) playTick(587, 0.12);

    if (res.actionHandlerType === 'download_txt' && res.contentSnippet) {
      try {
        const blob = new Blob([res.contentSnippet], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${res.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}.txt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        setDownloadSuccessMessage(`Downloaded "${res.title}" successfully.`);
        setTimeout(() => setDownloadSuccessMessage(null), 4000);
      } catch (e) {
        console.error('Download error:', e);
      }
    } else if (res.actionHandlerType === 'switch_app' && res.targetId && onSelectApp) {
      onSelectApp(res.targetId);
      if (onNavigateToTab) onNavigateToTab('workspace');
    } else if (res.actionHandlerType === 'open_wellbeing') {
      const el = document.getElementById('st-how-begin-practice-engine-embed');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else if (onNavigateToTab) {
        onNavigateToTab('wellbeing');
      } else {
        setActiveCategoryId('how-do-i-begin');
        setOpenCategories(getSingleOpenCategoryState('how-do-i-begin'));
      }
    } else if (res.actionHandlerType === 'open_accessibility' && onNavigateToTab) {
      onNavigateToTab('accessibility');
    } else {
      setPreviewResource(res);
    }
  };

  const handleBeginPractice = () => {
    setActiveCategoryId('how-do-i-begin');
    setOpenCategories(getSingleOpenCategoryState('how-do-i-begin'));
    setActiveSubItemId('hdib-space-between');
    if (onNavigateToTab) {
      onNavigateToTab('wellbeing');
    }
    if (playTick) playTick(600, 0.15);
  };

  return (
    <div className="w-full flex flex-col space-y-10 text-left text-[#1B0A3B] dark:text-slate-100" id="second-thought-website-wrapper">
      
      {/* Screen Reader Live Announcement Region */}
      <div className="sr-only" aria-live="polite" aria-atomic="true" id="st-sr-live-region">
        {srLiveAnnounce}
      </div>

      {/* Top Navigation & Control Bar */}
      <div className="flex items-center justify-between gap-3 border-b border-[#1B0A3B]/10 dark:border-slate-800 pb-3 text-[#1B0A3B] dark:text-slate-100" id="st-top-control-bar">
        <div className="flex items-center gap-2" id="st-top-controls-left">
          {/* Mobile Drawer Trigger */}
          <button
            id="st-mobile-nav-toggle-btn"
            onClick={() => {
              setIsMobileMenuOpen(!isMobileMenuOpen);
              if (playTick) playTick(420, 0.05);
            }}
            className="md:hidden px-3 py-1.5 rounded-lg border border-[#1B0A3B]/20 dark:border-slate-700 hover:border-[#1B0A3B]/50 bg-[#1B0A3B]/[0.02] text-xs font-semibold flex items-center gap-1.5 cursor-pointer text-[#1B0A3B] dark:text-slate-100"
            aria-label={isMobileMenuOpen ? "Close website menu" : "Open website navigation menu"}
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            <span>Menu</span>
          </button>

          {/* Quick Page Jump Chips */}
          <div className="hidden lg:flex items-center gap-1.5 pl-2" id="st-quick-nav-chips">
            {websiteNavHierarchy.map(cat => {
              const isSelected = activeCategoryId === cat.id;
              return (
                <button
                  key={cat.id}
                  id={`st-nav-chip-${cat.id}`}
                  onClick={() => {
                    setActiveCategoryId(cat.id);
                    setOpenCategories(getSingleOpenCategoryState(cat.id));
                    setActiveSubItemDetailId(null);
                    if (cat.subItems?.[0]) setActiveSubItemId(cat.subItems[0].id);
                    if (playTick) playTick(500, 0.04);
                  }}
                  className={`px-2.5 py-1 text-xs rounded-full border transition-all cursor-pointer font-medium ${
                    isSelected
                      ? 'bg-[#1B0A3B] text-white border-[#1B0A3B] font-semibold shadow-xs'
                      : 'border-[#1B0A3B]/15 dark:border-slate-700 text-[#1B0A3B] dark:text-slate-100 opacity-80 hover:opacity-100 hover:border-[#1B0A3B]/40'
                  }`}
                >
                  {cat.title}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Layout Grid: Sidebar Navigation + Content Reader */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start" id="st-website-main-grid">
        
        {/* SIDEBAR NAVIGATION */}
        <nav
          ref={sidebarNavRef}
          aria-label="Second Thought Website Navigation"
          id="st-sidebar-nav"
          className={`
            ${isMobileMenuOpen ? 'block fixed inset-x-4 top-20 z-50 max-h-[80vh] overflow-y-auto bg-background shadow-2xl' : 'hidden md:block relative bg-[#1B0A3B]/[0.01]'}
            ${isSidebarExpanded ? 'md:col-span-3 lg:col-span-3' : 'md:col-span-1'}
            ${isMobileMenuOpen ? 'p-4' : 'p-3 md:p-4'}
            space-y-4 transition-all duration-300 rounded-2xl border border-[#1B0A3B]/15 dark:border-slate-700 text-left text-[#1B0A3B] dark:text-slate-100
          `}
        >
          {/* Top-right Collapse / Expand Navigation Symbol inside the Sidebar Menu Box */}
          <div className="hidden md:flex items-center justify-between pb-2 border-b border-[#1B0A3B]/10 dark:border-slate-800/60" id="st-sidebar-header-bar">
            {isSidebarExpanded && (
              <span className="text-[11px] font-bold tracking-wider opacity-60 text-[#1B0A3B] dark:text-slate-100">
                Menu
              </span>
            )}
            <button
              id="st-sidebar-toggle-symbol"
              onClick={() => {
                setIsSidebarExpanded(!isSidebarExpanded);
                if (playTick) playTick(420, 0.05);
              }}
              className={`
                p-1.5 rounded-lg border border-[#1B0A3B]/20 dark:border-slate-700 hover:border-[#1B0A3B]/60 bg-[#1B0A3B]/5 hover:bg-[#1B0A3B]/10 transition-colors cursor-pointer text-[#1B0A3B] dark:text-slate-100 flex items-center justify-center
                ${isSidebarExpanded ? 'ml-auto' : 'mx-auto'}
              `}
              title={isSidebarExpanded ? "Collapse navigation menu" : "Expand navigation menu"}
              aria-label={isSidebarExpanded ? "Collapse navigation menu" : "Expand navigation menu"}
            >
              {isSidebarExpanded ? (
                <PanelLeftClose className="w-4 h-4 shrink-0 opacity-80" />
              ) : (
                <PanelLeftOpen className="w-4 h-4 shrink-0 opacity-80" />
              )}
            </button>
          </div>

          {isMobileMenuOpen && (
            <div className="flex justify-between items-center border-b border-[#1B0A3B]/10 dark:border-slate-800 pb-3 mb-2" id="st-mobile-nav-hdr">
              <span className="text-xs font-semibold tracking-wider text-[#1B0A3B] dark:text-slate-100">Menu</span>
              <button 
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-1 rounded-md opacity-70 hover:opacity-100 cursor-pointer text-[#1B0A3B] dark:text-slate-100"
                aria-label="Close navigation menu"
              >
                <X className="w-4 h-4 text-[#1B0A3B] dark:text-slate-100" />
              </button>
            </div>
          )}

          {(isSidebarExpanded || isMobileMenuOpen) && (
            <div className="relative" id="st-sidebar-search-box">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 opacity-50 text-[#1B0A3B] dark:text-slate-100" />
              <input
                id="st-sidebar-search-input"
                type="text"
                placeholder="Search sections..."
                value={sidebarSearch}
                onChange={(e) => setSidebarSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs text-[#1B0A3B] dark:text-slate-100 bg-[#1B0A3B]/5 border border-[#1B0A3B]/15 dark:border-slate-700 rounded-lg focus:outline-none focus:border-[#1B0A3B]/50 opacity-90 placeholder:text-[#1B0A3B] dark:text-slate-100/50"
                aria-label="Search sections"
              />
              {sidebarSearch && (
                <button
                  onClick={() => setSidebarSearch('')}
                  className="absolute right-2 top-2 text-[10px] opacity-60 hover:opacity-100 text-[#1B0A3B] dark:text-slate-100"
                >
                  Clear
                </button>
              )}
            </div>
          )}

          <div className="space-y-2" id="st-sidebar-categories-list" role="list">
            {websiteNavHierarchy.map((cat) => {
              const Icon = cat.icon;
              const isCatOpen = openCategories[cat.id] || sidebarSearch.length > 0;
              const isCatActive = activeCategoryId === cat.id;

              const matchingSubItems = (cat.subItems || []).filter(sub => 
                !sidebarSearch || 
                sub.title.toLowerCase().includes(sidebarSearch.toLowerCase()) ||
                cat.title.toLowerCase().includes(sidebarSearch.toLowerCase())
              );

              if (sidebarSearch && matchingSubItems.length === 0) {
                return null;
              }

              return (
                <div key={cat.id} className="space-y-1" id={`st-sidebar-cat-group-${cat.id}`} role="listitem">
                  
                  <div className="flex items-center justify-between" id={`st-cat-hdr-row-${cat.id}`}>
                    <button
                      id={`st-cat-btn-${cat.id}`}
                      onClick={() => {
                        if (!isSidebarExpanded && !isMobileMenuOpen) {
                          setIsSidebarExpanded(true);
                        }
                        setActiveCategoryId(cat.id);
                        setActiveSubItemDetailId(null);
                        toggleCategoryAccordion(cat.id);
                      }}
                      className={`
                        w-full px-2.5 py-2 rounded-xl text-left transition-all cursor-pointer flex items-center justify-between
                        focus-visible:ring-2 focus-visible:ring-[#1B0A3B] focus-visible:outline-none
                        ${isCatActive 
                          ? 'bg-[#1B0A3B] text-white font-semibold shadow-xs' 
                          : 'text-[#1B0A3B] dark:text-slate-100 hover:bg-[#1B0A3B]/5 opacity-85 hover:opacity-100'}
                      `}
                      aria-expanded={isCatOpen}
                      aria-controls={`st-subitems-panel-${cat.id}`}
                      aria-current={isCatActive ? 'location' : undefined}
                      title={cat.title}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Icon className="w-4 h-4 shrink-0" />
                        {(isSidebarExpanded || isMobileMenuOpen) && (
                          <span className="text-xs font-medium truncate" id={`st-cat-title-${cat.id}`}>
                            {cat.title}
                          </span>
                        )}
                      </div>

                      {(isSidebarExpanded || isMobileMenuOpen) && cat.subItems && cat.subItems.length > 0 && (
                        <span className="opacity-70 p-0.5" id={`st-cat-arrow-${cat.id}`}>
                          {isCatOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </span>
                      )}
                    </button>
                  </div>

                  {(isSidebarExpanded || isMobileMenuOpen) && isCatOpen && cat.subItems && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      id={`st-subitems-panel-${cat.id}`}
                      role="region"
                      aria-labelledby={`st-cat-btn-${cat.id}`}
                      className="pl-3 pr-1 space-y-1 border-l border-[#1B0A3B]/10 dark:border-slate-800 ml-3 py-1"
                    >
                      {matchingSubItems.map((sub) => {
                        const isSubActive = activeSubItemId === sub.id && isCatActive;

                        return (
                          <button
                            key={sub.id}
                            id={`st-subitem-btn-${sub.id}`}
                            onClick={() => handleSelectNavSubItem(cat.id, sub.id, sub.title)}
                            className={`
                              w-full px-2.5 py-1.5 rounded-lg text-left text-xs transition-all cursor-pointer flex items-center justify-between
                              focus-visible:ring-2 focus-visible:ring-[#1B0A3B] focus-visible:outline-none
                              ${isSubActive 
                                ? 'bg-[#1B0A3B]/10 text-[#1B0A3B] dark:text-slate-100 font-semibold border-l-2 border-[#1B0A3B]' 
                                : 'text-[#1B0A3B] dark:text-slate-100 opacity-80 hover:opacity-100 hover:bg-[#1B0A3B]/5'}
                            `}
                            aria-current={isSubActive ? 'page' : undefined}
                          >
                            <span className="truncate pr-1">{sub.title}</span>
                          </button>
                        );
                      })}
                    </motion.div>
                  )}

                </div>
              );
            })}
          </div>

          {/* ACCESSIBILITY SETTINGS OPEN ON SIDE MENU */}
          {(isSidebarExpanded || isMobileMenuOpen) && (
            <div className="pt-4 mt-4 border-t border-current/15 space-y-3" id="st-sidebar-accessibility-section">
              <div className="flex items-center gap-2 px-1 text-xs font-semibold tracking-wider opacity-80">
                <Sliders className="w-3.5 h-3.5 text-[#1B0A3B] shrink-0" />
                <span>Accessibility Settings</span>
              </div>
              <div className="space-y-2.5 p-3 rounded-xl border border-current/10 bg-current/[0.02] text-xs">
                {/* Font Size */}
                <div className="space-y-1">
                  <label className="text-[11px] font-medium opacity-70 block">Font Size</label>
                  <div className="grid grid-cols-3 gap-1">
                    {(['standard', 'large', 'extra-large'] as const).map(fs => (
                      <button
                        key={fs}
                        onClick={() => onSettingsChange && settings && onSettingsChange({ ...settings, fontSize: fs })}
                        className={`py-1 text-[10px] rounded border transition-colors cursor-pointer ${
                          settings?.fontSize === fs
                            ? 'bg-current text-background font-bold border-current'
                            : 'border-current/20 opacity-70 hover:opacity-100'
                        }`}
                      >
                        {fs === 'standard' ? 'Normal' : fs === 'large' ? 'Large' : 'Extra large'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Reduced Motion Toggle */}
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] opacity-80">Reduced Motion</span>
                  <button
                    onClick={() => onSettingsChange && settings && onSettingsChange({ ...settings, reducedMotion: !settings.reducedMotion })}
                    className={`px-2 py-0.5 text-[10px] rounded border transition-colors cursor-pointer ${
                      settings?.reducedMotion
                        ? 'bg-current text-background font-semibold border-current'
                        : 'border-current/20 opacity-70 hover:opacity-100'
                    }`}
                  >
                    {settings?.reducedMotion ? 'On' : 'Off'}
                  </button>
                </div>

                {/* Sound Toggle */}
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] opacity-80">Audio Feedback</span>
                  <button
                    onClick={() => onSettingsChange && settings && onSettingsChange({ ...settings, soundEnabled: !settings.soundEnabled })}
                    className={`px-2 py-0.5 text-[10px] rounded border transition-colors cursor-pointer ${
                      settings?.soundEnabled
                        ? 'bg-current text-background font-semibold border-current'
                        : 'border-current/20 opacity-70 hover:opacity-100'
                    }`}
                  >
                    {settings?.soundEnabled ? 'On' : 'Off'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </nav>

        {/* MAIN CONTENT AREA */}
        <main
          id="st-content-main-panel"
          className={`
            ${isSidebarExpanded ? 'md:col-span-9 lg:col-span-9' : 'md:col-span-11'}
            space-y-12 text-left transition-all duration-300 focus:outline-none
          `}
          role="main"
          aria-label={getMainHeadingLabel()}
          tabIndex={-1}
        >
          {downloadSuccessMessage && (
            <div className="p-3 bg-[#1D9E75]/10 border border-[#1D9E75]/30 rounded-xl text-xs font-medium text-[#0E6B50] dark:text-[#8CE0C6] flex items-center justify-between" id="st-download-alert">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#1D9E75]" />
                <span>{downloadSuccessMessage}</span>
              </div>
              <button onClick={() => setDownloadSuccessMessage(null)} className="opacity-60 hover:opacity-100 text-[11px] cursor-pointer">
                Dismiss
              </button>
            </div>
          )}

          {/* PAGE: I'M READY LANDING */}
          {activeCategoryId === 'ready' && (
            <div className="space-y-8 text-left text-[#1B0A3B] dark:text-slate-100" id="st-ready-landing-view">
              <div className="border-b border-[#1B0A3B]/10 dark:border-slate-800 pb-4 space-y-2">
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#1B0A3B] dark:text-slate-100" id="st-ready-page-heading">
                  {cmsText('ready.heading', 'I’m ready')}
                </h2>
                <p className="text-xs sm:text-sm opacity-80 leading-relaxed text-[#1B0A3B] dark:text-slate-200">
                  {cmsText('ready.intro', 'Choose where you would like to begin putting Second Thought into practice.')}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-stretch" id="st-ready-cards-grid">
                <article className="flex-1 px-6 md:px-10 py-5 flex flex-col justify-between space-y-8 text-left">
                  <div className="space-y-3">
                    <div className="text-[#1D9E75] w-fit">
                      <Sparkles className="w-6 h-6 shrink-0" />
                    </div>
                    <h3 className="text-lg font-bold text-[#1B0A3B] dark:text-slate-100" id="st-ready-card-begin-title">
                      {cmsText('ready.begin.title', 'How do I begin?')}
                    </h3>
                    <p className="text-xs sm:text-sm opacity-80 leading-relaxed text-[#1B0A3B] dark:text-slate-200" id="st-ready-card-begin-desc">
                      {cmsText('ready.begin.description', 'Simple entry points to pause, reflect, and deepen understanding.')}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveCategoryId('how-do-i-begin');
                      setActiveSubItemId('hdib-create-space');
                      setActiveSubItemDetailId(null);
                      setBeginCardSelection('none');
                      setOpenCategories(getSingleOpenCategoryState('how-do-i-begin'));
                      setSrLiveAnnounce(`Navigated to ${cmsText('ready.begin.title', 'How do I begin?')}`);
                      if (playTick) playTick(520, 0.08);
                    }}
                    className="inline-flex items-center gap-1.5 font-bold hover:underline cursor-pointer text-xs sm:text-sm w-fit"
                    style={{ color: BURGUNDY }}
                    aria-describedby="st-ready-card-begin-desc"
                  >
                    <span>{cmsText('ready.begin.button', 'Open How do I begin?')}</span>
                    <ArrowRight className="w-3.5 h-3.5 shrink-0" />
                  </button>
                </article>

                <div aria-hidden="true" className="hidden sm:block w-[2px] bg-[#912A4A] self-stretch my-12" />
                <div aria-hidden="true" className="sm:hidden h-[2px] bg-[#912A4A] w-full my-10" />

                <article className="flex-1 px-6 md:px-10 py-5 flex flex-col justify-between space-y-6 text-left">
                  <div className="space-y-3">
                    <div className="text-[#912A4A] w-fit">
                      <Layers className="w-6 h-6 shrink-0" />
                    </div>
                    <h3 className="text-lg font-bold text-[#1B0A3B] dark:text-slate-100" id="st-ready-card-ecosystem-title">
                      {cmsText('ready.ecosystem.title', 'The Second Thought Ecosystem')}
                    </h3>
                    <p className="text-xs sm:text-sm opacity-80 leading-relaxed text-[#1B0A3B] dark:text-slate-200" id="st-ready-card-ecosystem-desc">
                      {cmsText('ready.ecosystem.description', 'Practice Framework, Apps, Publications, and Research for Second Thought.')}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveCategoryId('in-practice');
                      setActiveSubItemId('ip-framework');
                      setActiveSubItemDetailId(null);
                      setBeginCardSelection('none');
                      setOpenCategories(getSingleOpenCategoryState('in-practice'));
                      setSrLiveAnnounce(`Navigated to ${cmsText('ready.ecosystem.title', 'The Second Thought Ecosystem')}`);
                      if (playTick) playTick(520, 0.08);
                    }}
                    className="inline-flex items-center gap-1.5 font-bold hover:underline cursor-pointer text-xs sm:text-sm w-fit"
                    style={{ color: BURGUNDY }}
                    aria-describedby="st-ready-card-ecosystem-desc"
                  >
                    <span>{cmsText('ready.ecosystem.button', 'Open The Second Thought Ecosystem')}</span>
                    <ArrowRight className="w-3.5 h-3.5 shrink-0" />
                  </button>
                </article>
              </div>
            </div>
          )}

          {/* PAGE 1: HOME */}
          {activeCategoryId === 'home' && (
            <div className="space-y-12 text-left text-[#1B0A3B] dark:text-slate-100" id="st-home-page-view">
              <h2 className="sr-only" id="st-home-page-heading">
                Second Thought home
              </h2>
              
              {/* Question Above Photo */}
              <div className="flex flex-col space-y-5 sm:space-y-6 py-2 text-left" id="home-questions-grid">
                <div className="text-left max-w-3xl">
                  <p className="text-lg sm:text-xl md:text-2xl font-medium leading-relaxed text-[#1B0A3B] dark:text-slate-100">
                    {cmsText('home.question', 'How can human beings respond with reverence for life when frightened, angry, hurt, under peer pressure, or when their identity and relationships feel at risk?')}
                  </p>
                </div>
              </div>

              {/* Homepage Hero Image (fixed — visitors cannot change it) */}
              <div
                id="homepage-photo-container"
                className="w-full rounded-2xl border border-[#1B0A3B]/15 dark:border-slate-700 bg-[#1B0A3B]/[0.02] dark:bg-slate-900/40 p-4 sm:p-6 text-left shadow-2xs space-y-4"
              >
                <div className="relative w-full aspect-[16/9] max-h-[480px] md:max-h-[540px] rounded-xl overflow-hidden">
                  <img
                    id="homepage-landscape-photo"
                    src={DEFAULT_HERO_IMAGE}
                    alt={cmsText('home.imageCaption', 'Performance installation at Ramsay Art Prize, Art Gallery of South Australia')}
                    className="w-full h-full object-cover rounded-xl"
                  />
                </div>
                <p className="text-xs opacity-70 text-[#1B0A3B] dark:text-slate-300 leading-relaxed" id="homepage-photo-caption">
                  {cmsText('home.imageCaption', 'Performance installation at Ramsay Art Prize, Art Gallery of South Australia')}
                </p>
              </div>

              {/* Text Block 0.91 inches (~87px) below image with 1.5 line-height */}
              <div className="mt-[87px] space-y-5 text-[#1B0A3B] dark:text-slate-100 text-base sm:text-lg leading-[1.5]" id="home-text-below-photo">
                <p className="font-semibold text-lg sm:text-xl leading-[1.5]">
                  {cmsText('home.statement', 'This is the central question of Second Thought.')}
                </p>
                <p className="leading-[1.5] opacity-90">
                  {cmsText('home.paragraph1', 'Fear, hurt and misunderstanding are part of the human experience. So is the ability to pause and reconsider.')}
                </p>
                <p className="leading-[1.5] opacity-90">
                  {cmsText('home.paragraph2', 'Research shows that we naturally protect our existing beliefs, especially when they are shaped by experience, identity or fear. Yet transformation begins when we reconsider. This is where we create space for other perspectives, examining what we think we know before choosing how to respond.')}
                </p>
                <p className="font-medium text-base sm:text-lg leading-[1.5]">
                  {cmsText('home.paragraph3', 'How can we change our responses before they become harm?')}
                </p>
                <p className="leading-[1.5] opacity-90">
                  {cmsText('home.paragraph4', 'Second Thought invites us into that space — a practice of noticing, listening and choosing with greater awareness.')}
                </p>

                {/* Hyperlink to What is Second Thought page */}
                <div className="pt-4" id="home-what-is-link-container">
                  <button
                    onClick={() => {
                      setActiveCategoryId('what-is-second-thought');
                      setActiveSubItemId('st-what-is-it');
                      setOpenCategories(getSingleOpenCategoryState('what-is-second-thought'));
                      if (playTick) playTick(500, 0.05);
                    }}
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-[#1B0A3B]/20 dark:border-slate-700 hover:border-[#1B0A3B]/40 bg-[#1B0A3B]/[0.03] hover:bg-[#1B0A3B]/[0.07] transition-all text-left font-semibold text-sm sm:text-base text-[#1B0A3B] dark:text-slate-100 cursor-pointer group shadow-2xs"
                  >
                    <span>{cmsText('home.whatIsButton', 'What is Second Thought?')}</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* PAGE 2: WHAT IS SECOND THOUGHT? */}
          {activeCategoryId === 'what-is-second-thought' && (
            <div className="space-y-8 text-left text-[#1B0A3B] dark:text-slate-100" id="st-what-is-page-view">
              <button
                type="button"
                onClick={navigateToExploreLanding}
                className="inline-flex items-center gap-2 font-bold hover:underline cursor-pointer text-sm sm:text-base text-[#1B0A3B]"
              >
                <ArrowLeft className="w-4 h-4 shrink-0" />
                <span>Back to Explore</span>
              </button>
              
              {/* UNBOXED SUB-ITEM DETAIL VIEW */}
              {activeSubItemDetailId ? (() => {
                const currentSub = websiteNavHierarchy.flatMap(c => c.subItems || []).find(s => s.id === activeSubItemDetailId);
                if (!currentSub) return null;

                return (
                  <div className="space-y-8 text-left text-[#1B0A3B] dark:text-slate-100" id="st-detail-page-view">
                    {/* Top Bar with Back and Collapse Controls */}
                    <div className="flex items-center justify-between border-b border-[#1B0A3B]/10 dark:border-slate-800 pb-4">
                      <button
                        onClick={() => {
                          setActiveSubItemDetailId(null);
                          if (playTick) playTick(450, 0.05);
                        }}
                        className="inline-flex items-center gap-2 font-bold hover:underline cursor-pointer text-sm sm:text-base"
                        style={{ color: BURGUNDY }}
                      >
                        <ArrowLeft className="w-4 h-4 shrink-0" />
                        <span>Back to What is Second Thought</span>
                      </button>

                      <button
                        onClick={() => {
                          setActiveSubItemDetailId(null);
                          if (playTick) playTick(450, 0.05);
                        }}
                        className="st-action-burgundy inline-flex items-center gap-1 font-bold hover:underline cursor-pointer text-xs sm:text-sm"
                        style={{ color: BURGUNDY }}
                      >
                        <span>See less</span>
                        <ChevronUp className="w-4 h-4 shrink-0" />
                      </button>
                    </div>

                    {/* Detail View Title */}
                    <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1B0A3B] dark:text-slate-100">
                      {currentSub.title}
                    </h2>

                    {currentSub.id === 'st-framework' || currentSub.id === 'ip-framework' ? (
                      <div className="space-y-6">
                        {/* 2nd layer paragraph */}
                        <p className="text-base sm:text-lg leading-relaxed font-normal text-[#1B0A3B] dark:text-slate-100 opacity-95">
                          The Second Thought Framework is a reflective practice for individuals, organisations, communities, and systems.
                        </p>

                        <ResearchInsight {...RESEARCH_INSIGHTS.framework} />

                        {/* Interactive framework sections - Look, Ask, Think a Second Time as plus / minus progressive disclosure */}
                        <div className="space-y-2 pt-4 border-t border-[#1B0A3B]/10 dark:border-slate-800">
                          {currentSub.layer2.sections.slice(0, 3).map((sec, idx) => {
                            const isExpanded = !!expandedFrameworkSections[idx];
                            return (
                              <div key={idx} className="text-left py-1">
                                <button
                                  onClick={() => toggleFrameworkSection(idx)}
                                  className="w-full text-left flex items-center justify-between gap-3 font-bold text-base sm:text-lg text-[#1B0A3B] dark:text-slate-100 hover:opacity-80 transition-opacity cursor-pointer group py-1"
                                  aria-expanded={isExpanded}
                                >
                                  <span className="leading-snug font-bold">{sec.heading}</span>
                                  <div
                                    className="flex items-center justify-center shrink-0 p-1 opacity-80 hover:opacity-100 transition-opacity"
                                    style={{ color: BURGUNDY }}
                                    aria-label={isExpanded ? 'Collapse' : 'Expand'}
                                  >
                                    {isExpanded ? <Minus className="w-5 h-5 shrink-0 text-[#912A4A]" /> : <Plus className="w-5 h-5 shrink-0 text-[#912A4A]" />}
                                  </div>
                                </button>

                                {isExpanded && (
                                  <div className="pl-1 pr-2 pt-2 pb-3">
                                    {renderLongFormBody(sec.body, 'text-sm sm:text-base leading-relaxed opacity-90 text-[#1B0A3B] dark:text-slate-100 font-normal')}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>

                        {/* Practice & Repetition, Applications as standard non-collapsible sections */}
                        {currentSub.layer2.sections.length > 3 && (
                          <div className="space-y-6 pt-6 border-t border-[#1B0A3B]/10 dark:border-slate-800 text-sm sm:text-base leading-relaxed opacity-90 text-[#1B0A3B] dark:text-slate-100">
                            {currentSub.layer2.sections.slice(3).map((sec, idx) => (
                              <div key={idx} className="space-y-2">
                                {sec.heading && (
                                  <h3 className="text-lg sm:text-xl font-bold text-[#1B0A3B] dark:text-slate-100">
                                    {sec.heading}
                                  </h3>
                                )}
                                {renderLongFormBody(sec.body, 'text-sm sm:text-base leading-relaxed opacity-90')}
                              </div>
                            ))}
                          </div>
                        )}

                      </div>
                    ) : currentSub.id === 'st-conversation-other-perspectives' ? (
                      <div className="space-y-6">
                        <p className="text-base sm:text-lg leading-relaxed font-normal text-[#1B0A3B] dark:text-slate-100 opacity-95">
                          {currentSub.layer1.orientation}
                        </p>

                        <p className="text-base sm:text-lg leading-relaxed font-normal text-[#1B0A3B] dark:text-slate-100 opacity-95">
                          {currentSub.layer2.title}
                        </p>

                        <div className="space-y-2 pt-4 border-t border-[#1B0A3B]/10 dark:border-slate-800">
                          {currentSub.layer2.sections.map((sec, idx) => {
                            const isExpanded = !!expandedConversationSections[idx];
                            return (
                              <div key={idx} className="text-left py-1">
                                <button
                                  onClick={() => toggleConversationSection(idx)}
                                  className="w-full text-left flex items-center justify-between gap-3 font-bold text-base sm:text-lg text-[#1B0A3B] dark:text-slate-100 hover:opacity-80 transition-opacity cursor-pointer group py-1"
                                  aria-expanded={isExpanded}
                                >
                                  <span className="leading-snug font-bold">{sec.heading}</span>
                                  <div
                                    className="flex items-center justify-center shrink-0 p-1 opacity-80 hover:opacity-100 transition-opacity"
                                    style={{ color: BURGUNDY }}
                                    aria-label={isExpanded ? 'Collapse' : 'Expand'}
                                  >
                                    {isExpanded ? <Minus className="w-5 h-5 shrink-0 text-[#912A4A]" /> : <Plus className="w-5 h-5 shrink-0 text-[#912A4A]" />}
                                  </div>
                                </button>

                                {isExpanded && (
                                  <div className="pl-1 pr-2 pt-2 pb-3">
                                    {renderLongFormBody(sec.body, 'text-sm sm:text-base leading-relaxed opacity-90 text-[#1B0A3B] dark:text-slate-100 font-normal')}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ) : currentSub.id === 'st-why-it-matters' ? (
                      <div className="space-y-6">
                        {/* 2nd layer paragraph */}
                        <p className="text-base sm:text-lg leading-relaxed font-normal text-[#1B0A3B] dark:text-slate-100 opacity-95">
                          {currentSub.layer1.orientation}
                        </p>

                        {/* 5 Bullet sentences - unboxed list with plus / minus icon */}
                        <div className="space-y-2 pt-4 border-t border-[#1B0A3B]/10 dark:border-slate-800">
                          {currentSub.layer2.sections.map((sec, idx) => {
                            const isExpanded = !!expandedWhySections[idx];
                            return (
                              <div key={idx} className="text-left py-1">
                                <button
                                  onClick={() => toggleWhySection(idx)}
                                  className="w-full text-left flex items-center justify-between gap-3 font-normal text-base sm:text-lg text-[#1B0A3B] dark:text-slate-100 hover:opacity-80 transition-opacity cursor-pointer group py-1"
                                  aria-expanded={isExpanded}
                                >
                                  <div className="flex items-start sm:items-center gap-3 min-w-0">
                                    <span className="text-lg text-[#912A4A] shrink-0 font-extrabold">•</span>
                                    <span className="leading-snug font-normal">{sec.heading}</span>
                                  </div>
                                  <div
                                    className="flex items-center justify-center shrink-0 p-1 opacity-80 hover:opacity-100 transition-opacity"
                                    style={{ color: BURGUNDY }}
                                    aria-label={isExpanded ? 'Collapse' : 'Expand'}
                                  >
                                    {isExpanded ? <Minus className="w-5 h-5 shrink-0 text-[#912A4A]" /> : <Plus className="w-5 h-5 shrink-0 text-[#912A4A]" />}
                                  </div>
                                </button>

                                {isExpanded && (
                                  <div className="pl-7 pr-2 pt-2 pb-3">
                                    {renderLongFormBody(sec.body, 'text-sm sm:text-base leading-relaxed opacity-90 text-[#1B0A3B] dark:text-slate-100 font-normal')}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>

                        {/* Ending sentence */}
                        <div className="pt-2 text-base sm:text-lg font-normal leading-relaxed text-[#1B0A3B] dark:text-slate-100 opacity-95">
                          The future will be shaped not just by technology but how we choose to use it to see one another.
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="text-base sm:text-lg leading-relaxed font-medium text-[#1B0A3B] dark:text-slate-100 opacity-95 whitespace-pre-line">
                          {currentSub.layer1.orientation}
                        </div>

                        <div className="space-y-6 pt-6 border-t border-[#1B0A3B]/10 dark:border-slate-800 text-sm sm:text-base leading-relaxed opacity-90 text-[#1B0A3B] dark:text-slate-100">
                          {currentSub.layer2.sections.map((sec, idx) => (
                            <div key={idx} className="space-y-2">
                              {sec.heading && (
                                <h3 className="text-lg sm:text-xl font-bold text-[#1B0A3B] dark:text-slate-100">
                                  {sec.heading}
                                </h3>
                              )}
                              {renderLongFormBody(sec.body, 'text-sm sm:text-base leading-relaxed opacity-90')}
                            </div>
                          ))}

                          {currentSub.layer2.quote && (
                            <div className="pt-2 text-sm sm:text-base opacity-85 border-l-2 pl-4 border-[#912A4A]">
                              {currentSub.layer2.quote}
                            </div>
                          )}
                        </div>
                      </>
                    )}

                    {/* End of 2nd Layer Collapse Button */}
                    <div className="pt-8 border-t border-[#1B0A3B]/10 dark:border-slate-800 flex justify-end">
                      <button
                        onClick={() => {
                          setActiveSubItemDetailId(null);
                          if (playTick) playTick(480, 0.05);
                        }}
                        className="st-action-burgundy inline-flex items-center gap-1.5 font-bold hover:underline cursor-pointer text-sm sm:text-base"
                        style={{ color: BURGUNDY }}
                      >
                        <span>See less</span>
                        <ChevronUp className="w-4 h-4 shrink-0" />
                      </button>
                    </div>
                  </div>
                );
              })() : (
                /* PARENT PAGE: 1ST LAYER + 6 CARDS SCREEN */
                <div className="space-y-8 text-left text-[#1B0A3B] dark:text-slate-100" id="st-what-is-cards-overview">
                  
                  {/* Header Title & Primary Layer 1 Card */}
                  <div className="space-y-6 border-b border-[#1B0A3B]/10 dark:border-slate-800 pb-6">
                    <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1B0A3B] dark:text-slate-100" id="st-page-main-heading">
{cmsText('nav.category.what-is-second-thought.title', 'What is Second Thought?')}
                    </h2>

                    {(() => {
                      const sub1 = websiteNavHierarchy.find(c => c.id === 'what-is-second-thought')?.subItems?.find(s => s.id === 'st-what-is-it');
                      if (!sub1) return null;

                      return (
                        <div className="p-6 sm:p-7 rounded-2xl border border-[#1B0A3B]/15 dark:border-slate-700 bg-[#1B0A3B]/[0.01] hover:bg-[#1B0A3B]/[0.03] transition-colors space-y-4 text-left">
                          <h3 className="text-lg sm:text-xl font-bold tracking-tight text-[#1B0A3B] dark:text-slate-100">
                            {sub1.title}
                          </h3>
                          <p className="text-sm sm:text-base leading-relaxed font-medium text-[#1B0A3B] dark:text-slate-100 opacity-95">
                            {sub1.layer1.orientation}
                          </p>
                          <div className="pt-2">
                            <button
                              onClick={() => {
                                setActiveSubItemDetailId(sub1.id);
                                if (playTick) playTick(500, 0.05);
                              }}
                              className="st-action-burgundy inline-flex items-center gap-1.5 font-bold hover:underline cursor-pointer text-sm"
                              style={{ color: BURGUNDY }}
                            >
                              <span>Find out more</span>
                              <ArrowRight className="w-4 h-4 shrink-0" />
                            </button>
                          </div>
                        </div>
                      );
                    })()}
                  </div>

                  {/* 6 CARDS GRID */}
                  <div className="space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-stretch" id="st-what-cards-grid">
                      {(websiteNavHierarchy.find(c => c.id === 'what-is-second-thought')?.subItems || [])
                        .filter(sub => sub.id !== 'st-what-is-it')
                        .map((sub, index) => {
                          return (
                            <React.Fragment key={sub.id}>
                              {index > 0 && (
                                <>
                                  <div aria-hidden="true" className="hidden sm:block w-[2px] bg-[#912A4A] self-stretch my-12" />
                                  <div aria-hidden="true" className="sm:hidden h-[2px] bg-[#912A4A] w-full my-10" />
                                </>
                              )}
                              <div
                              id={`st-what-card-${sub.id}`}
                              className="flex-1 px-6 md:px-10 py-5 transition-colors flex flex-col justify-between space-y-4 text-left"
                            >
                              <div className="space-y-3 flex-1 flex flex-col justify-start">
                                <h3 className="text-lg sm:text-xl font-bold tracking-tight text-[#1B0A3B] dark:text-slate-100">
                                  {sub.title}
                                </h3>

                                <div className="text-xs sm:text-sm opacity-90 leading-relaxed text-[#1B0A3B] dark:text-slate-100">
                                  <p className="whitespace-pre-line">{sub.layer1.orientation}</p>
                                </div>
                              </div>

                              <div className="pt-2">
                                <button
                                  onClick={() => {
                                    setActiveSubItemDetailId(sub.id);
                                    if (playTick) playTick(520, 0.05);
                                  }}
                                  className="st-action-burgundy inline-flex items-center gap-1.5 font-bold hover:underline cursor-pointer text-xs sm:text-sm"
                                  style={{ color: BURGUNDY }}
                                >
                                  <span>Find out more</span>
                                  <ArrowRight className="w-3.5 h-3.5 shrink-0" />
                                </button>
                              </div>
                            </div>
                              </React.Fragment>
                          );
                        })}
                    </div>
                  </div>

                </div>
              )}

            </div>
          )}

          {/* PAGE 3: WHY IT MATTERS? */}
          {activeCategoryId === 'why-it-matters' && (
            <div className="space-y-8 text-left text-[#1B0A3B] dark:text-slate-100" id="st-why-it-matters-page-view">
              
              {activeSubItemDetailId ? (() => {
                const currentSub = websiteNavHierarchy.flatMap(c => c.subItems || []).find(s => s.id === activeSubItemDetailId);
                if (!currentSub) return null;

                return (
                  <div className="space-y-8 text-left text-[#1B0A3B] dark:text-slate-100" id="st-why-detail-view">
                    <div className="flex items-center justify-between border-b border-[#1B0A3B]/10 dark:border-slate-800 pb-4">
                      <button
                        onClick={() => {
                          setActiveSubItemDetailId(null);
                          if (playTick) playTick(450, 0.05);
                        }}
                        className="inline-flex items-center gap-2 font-bold hover:underline cursor-pointer text-sm sm:text-base"
                        style={{ color: BURGUNDY }}
                      >
                        <ArrowLeft className="w-4 h-4 shrink-0" />
                        <span>Back to {currentSub.title}</span>
                      </button>

                      <button
                        onClick={() => {
                          setActiveSubItemDetailId(null);
                          if (playTick) playTick(450, 0.05);
                        }}
                        className="st-action-burgundy inline-flex items-center gap-1 font-bold hover:underline cursor-pointer text-xs sm:text-sm"
                        style={{ color: BURGUNDY }}
                      >
                        <span>See less</span>
                        <ChevronUp className="w-4 h-4 shrink-0" />
                      </button>
                    </div>

                    <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1B0A3B] dark:text-slate-100">
                      {currentSub.title}
                    </h2>

                    {currentSub.id === 'st-framework' || currentSub.id === 'ip-framework' ? (
                      <div className="space-y-6">
                        {/* 2nd layer paragraph */}
                        <p className="text-base sm:text-lg leading-relaxed font-normal text-[#1B0A3B] dark:text-slate-100 opacity-95">
                          The Second Thought Framework is a reflective practice for individuals, organisations, communities, and systems.
                        </p>

                        <ResearchInsight {...RESEARCH_INSIGHTS.framework} />

                        {/* Interactive framework sections - unboxed list with plus / minus icon (no bullets) */}
                        <div className="space-y-2 pt-4 border-t border-[#1B0A3B]/10 dark:border-slate-800">
                          {currentSub.layer2.sections.map((sec, idx) => {
                            const isExpanded = !!expandedFrameworkSections[idx];
                            return (
                              <div key={idx} className="text-left py-1">
                                <button
                                  onClick={() => toggleFrameworkSection(idx)}
                                  className="w-full text-left flex items-center justify-between gap-3 font-bold text-base sm:text-lg text-[#1B0A3B] dark:text-slate-100 hover:opacity-80 transition-opacity cursor-pointer group py-1"
                                  aria-expanded={isExpanded}
                                >
                                  <span className="leading-snug font-bold">{sec.heading}</span>
                                  <div
                                    className="flex items-center justify-center shrink-0 p-1 opacity-80 hover:opacity-100 transition-opacity"
                                    style={{ color: BURGUNDY }}
                                    aria-label={isExpanded ? 'Collapse' : 'Expand'}
                                  >
                                    {isExpanded ? <Minus className="w-5 h-5 shrink-0 text-[#912A4A]" /> : <Plus className="w-5 h-5 shrink-0 text-[#912A4A]" />}
                                  </div>
                                </button>

                                {isExpanded && (
                                  <div className="pl-1 pr-2 pt-2 pb-3">
                                    {renderLongFormBody(sec.body, 'text-sm sm:text-base leading-relaxed opacity-90 text-[#1B0A3B] dark:text-slate-100 font-normal')}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>

                      </div>
                    ) : currentSub.id === 'st-why-it-matters' ? (
                      <div className="space-y-6">
                        {/* 2nd layer paragraph */}
                        <p className="text-base sm:text-lg leading-relaxed font-normal text-[#1B0A3B] dark:text-slate-100 opacity-95">
                          {currentSub.layer1.orientation}
                        </p>

                        {/* 5 Bullet sentences - unboxed list with plus / minus icon */}
                        <div className="space-y-2 pt-4 border-t border-[#1B0A3B]/10 dark:border-slate-800">
                          {currentSub.layer2.sections.map((sec, idx) => {
                            const isExpanded = !!expandedWhySections[idx];
                            return (
                              <div key={idx} className="text-left py-1">
                                <button
                                  onClick={() => toggleWhySection(idx)}
                                  className="w-full text-left flex items-center justify-between gap-3 font-normal text-base sm:text-lg text-[#1B0A3B] dark:text-slate-100 hover:opacity-80 transition-opacity cursor-pointer group py-1"
                                  aria-expanded={isExpanded}
                                >
                                  <div className="flex items-start sm:items-center gap-3 min-w-0">
                                    <span className="text-lg text-[#912A4A] shrink-0 font-extrabold">•</span>
                                    <span className="leading-snug font-normal">{sec.heading}</span>
                                  </div>
                                  <div
                                    className="flex items-center justify-center shrink-0 p-1 opacity-80 hover:opacity-100 transition-opacity"
                                    style={{ color: BURGUNDY }}
                                    aria-label={isExpanded ? 'Collapse' : 'Expand'}
                                  >
                                    {isExpanded ? <Minus className="w-5 h-5 shrink-0 text-[#912A4A]" /> : <Plus className="w-5 h-5 shrink-0 text-[#912A4A]" />}
                                  </div>
                                </button>

                                {isExpanded && (
                                  <div className="pl-7 pr-2 pt-2 pb-3">
                                    {renderLongFormBody(sec.body, 'text-sm sm:text-base leading-relaxed opacity-90 text-[#1B0A3B] dark:text-slate-100 font-normal')}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>

                        {/* Ending sentence */}
                        <div className="pt-2 text-base sm:text-lg font-normal leading-relaxed text-[#1B0A3B] dark:text-slate-100 opacity-95">
                          The future will be shaped not just by technology but how we choose to use it to see one another.
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="text-base sm:text-lg leading-relaxed font-medium text-[#1B0A3B] dark:text-slate-100 opacity-95 whitespace-pre-line">
                          {currentSub.layer1.orientation}
                        </div>

                        <div className="space-y-6 pt-6 border-t border-[#1B0A3B]/10 dark:border-slate-800 text-sm sm:text-base leading-relaxed opacity-90 text-[#1B0A3B] dark:text-slate-100">
                          {currentSub.layer2.sections.map((sec, idx) => (
                            <div key={idx} className="space-y-2">
                              {sec.heading && (
                                <h3 className="text-lg sm:text-xl font-bold text-[#1B0A3B] dark:text-slate-100">
                                  {sec.heading}
                                </h3>
                              )}
                              {renderLongFormBody(sec.body, 'text-sm sm:text-base leading-relaxed opacity-90')}
                            </div>
                          ))}

                          {currentSub.layer2.quote && (
                            <div className="pt-2 text-sm sm:text-base opacity-85 border-l-2 pl-4 border-[#912A4A]">
                              {currentSub.layer2.quote}
                            </div>
                          )}
                        </div>
                      </>
                    )}

                    <div className="pt-8 border-t border-[#1B0A3B]/10 dark:border-slate-800 flex justify-end">
                      <button
                        onClick={() => {
                          setActiveSubItemDetailId(null);
                          if (playTick) playTick(480, 0.05);
                        }}
                        className="st-action-burgundy inline-flex items-center gap-1.5 font-bold hover:underline cursor-pointer text-sm sm:text-base"
                        style={{ color: BURGUNDY }}
                      >
                        <span>See less</span>
                        <ChevronUp className="w-4 h-4 shrink-0" />
                      </button>
                    </div>
                  </div>
                );
              })() : (
                <div className="space-y-8" id="st-why-cards-overview">
                  <div className="border-b border-[#1B0A3B]/10 dark:border-slate-800 pb-4 space-y-2">
                    <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#1B0A3B] dark:text-slate-100" id="st-page-main-heading">
                      Why Second Thought Matters
                    </h2>
                    <p className="text-xs sm:text-sm opacity-80 leading-relaxed text-[#1B0A3B] dark:text-slate-200">
                      An open space for reflection, curiosity, and human dignity.
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-stretch" id="st-why-cards-grid">
                    {(websiteNavHierarchy.find(c => c.id === 'why-it-matters')?.subItems || []).map((cardItem, index) => {
                      return (
                        <React.Fragment key={cardItem.id}>
                          {index > 0 && (
                            <>
                              <div aria-hidden="true" className="hidden sm:block w-[2px] bg-[#912A4A] self-stretch my-12" />
                              <div aria-hidden="true" className="sm:hidden h-[2px] bg-[#912A4A] w-full my-10" />
                            </>
                          )}
                        <div
                          key={cardItem.id}
                          id={`st-why-card-${cardItem.id}`}
                          className="flex-1 px-6 md:px-10 py-5 transition-colors flex flex-col justify-between space-y-4 text-left"
                        >
                          <div className="space-y-3 flex-1 flex flex-col justify-start">
                            <h3 className="text-lg sm:text-xl font-bold tracking-tight text-[#1B0A3B] dark:text-slate-100">
                              {cardItem.title}
                            </h3>
                            <p className="text-xs sm:text-sm opacity-90 leading-relaxed text-[#1B0A3B] dark:text-slate-100 whitespace-pre-line">
                              {cardItem.layer1.orientation}
                            </p>
                          </div>

                          <div className="pt-2">
                            <button
                              onClick={() => {
                                setActiveSubItemDetailId(cardItem.id);
                                if (playTick) playTick(520, 0.05);
                              }}
                              className="st-action-burgundy inline-flex items-center gap-1.5 font-bold hover:underline cursor-pointer text-xs sm:text-sm"
                              style={{ color: BURGUNDY }}
                            >
                              <span>Find out more</span>
                              <ArrowRight className="w-3.5 h-3.5 shrink-0" />
                            </button>
                          </div>
                        </div>
                          </React.Fragment>
                      );
                    })}
                  </div>
                </div>
              )}

            </div>
          )}

          {/* PAGE 4: HOW DO I BEGIN? */}
          {activeCategoryId === 'how-do-i-begin' && (
            <div className="space-y-6 text-left" id="st-how-to-begin-page-view">
              <button
                type="button"
                onClick={navigateToReadyLanding}
                className="inline-flex items-center gap-2 font-bold hover:underline cursor-pointer text-sm sm:text-base text-[#1B0A3B]"
              >
                <ArrowLeft className="w-4 h-4 shrink-0" />
                <span>Back to I’m ready</span>
              </button>
              {beginCardSelection === 'none' && (
                <div className="space-y-6" id="st-begin-overview">
                  <div className="border-b border-[#1B0A3B]/10 dark:border-slate-800 pb-4 space-y-2">
                    <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#1B0A3B] dark:text-slate-100" id="st-page-main-heading">
                      {cmsText('nav.category.how-do-i-begin.title', 'How do I begin?')}
                    </h2>
                    <p className="text-xs sm:text-sm opacity-80 leading-relaxed text-[#1B0A3B] dark:text-slate-200">
                      {cmsText('nav.category.how-do-i-begin.summary', 'Create space in between an event and your choice of response.')}
                    </p>
                  </div>

                  {/* TWO CARDS ONLY */}
                  <div className="flex flex-col sm:flex-row sm:items-stretch" id="st-begin-cards-grid">
                    
                    {/* Card 1: Create space */}
                    <div 
                      onClick={() => {
                        setBeginCardSelection('pause');
                        if (playTick) playTick(480, 0.08);
                      }}
                      className="flex-1 px-6 md:px-10 py-5 transition-all cursor-pointer flex flex-col justify-between space-y-6 group" 
                      id="st-begin-card-pause"
                    >
                      <div className="space-y-3">
                        <div className="text-[#1D9E75] w-fit">
                          <Wind className="w-6 h-6 shrink-0" />
                        </div>
                        <h3 className="text-lg font-bold text-[#1B0A3B] dark:text-slate-100 group-hover:text-[#1D9E75] dark:group-hover:text-[#8CE0C6] transition-colors">
                          Create space
                        </h3>
                        <p className="text-xs sm:text-sm opacity-80 leading-relaxed text-[#1B0A3B] dark:text-slate-200">
                          Create space in between an event and your choice of response.
                        </p>
                      </div>
                      <div className="st-action-burgundy pt-2 flex items-center gap-1.5 text-xs font-semibold group-hover:translate-x-1 transition-transform">
                        <span>Find out more</span>
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </div>

                    <div aria-hidden="true" className="hidden sm:block w-[2px] bg-[#912A4A] self-stretch my-12" />
                    <div aria-hidden="true" className="sm:hidden h-[2px] bg-[#912A4A] w-full my-10" />

                    {/* Card 2: The Second Thought Practice Engine */}
                    <div 
                      onClick={() => {
                        setBeginCardSelection('engine');
                        if (playTick) playTick(540, 0.08);
                      }}
                      className="flex-1 px-6 md:px-10 py-5 transition-all cursor-pointer flex flex-col justify-between space-y-6 group" 
                      id="st-begin-card-engine"
                    >
                      <div className="space-y-3">
                        <div className="text-[#1D9E75] w-fit">
                          <Sparkles className="w-6 h-6 shrink-0" />
                        </div>
                        <h3 className="text-lg font-bold text-[#1B0A3B] dark:text-slate-100 group-hover:text-[#1D9E75] dark:group-hover:text-[#8CE0C6] transition-colors">
                          The Second Thought Practice Engine
                        </h3>
                        <p className="text-xs sm:text-sm opacity-80 leading-relaxed text-[#1B0A3B] dark:text-slate-200">
                          Use our Practice Engine, a tool enhanced by artificial intelligence.
                        </p>
                      </div>
                      <div className="pt-2 flex items-center gap-1.5 text-xs font-semibold text-[#1B0A3B] dark:text-slate-100 group-hover:translate-x-1 transition-transform">
                        <span>Open Practice Engine</span>
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </div>

                  </div>
                </div>
              )}

              {/* PRACTICE ENGINE VIEW */}
              {beginCardSelection === 'engine' && (
                <div className="space-y-5" id="st-begin-engine-view">
                  <button
                    onClick={() => setBeginCardSelection('none')}
                    className="px-3.5 py-1.5 rounded-xl border border-[#1B0A3B]/20 dark:border-slate-700 hover:border-[#1B0A3B]/60 text-xs font-semibold text-[#1B0A3B] dark:text-slate-100 flex items-center gap-2 cursor-pointer transition-colors bg-[#1B0A3B]/5 dark:bg-slate-800"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back to How do I begin</span>
                  </button>

                  <div className="border-b border-[#1B0A3B]/10 dark:border-slate-800 pb-4 space-y-2 text-left">
                    <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#1B0A3B] dark:text-slate-100" id="st-practice-engine-embed-heading">
                      The Second Thought Practice Engine
                    </h2>
                    <p className="text-xs sm:text-sm opacity-80 leading-relaxed text-[#1B0A3B] dark:text-slate-200">
                      Use a guided reflective space grounded in the Second Thought framework.
                    </p>
                  </div>

                  <div className="max-w-3xl mx-auto text-[#1B0A3B] dark:text-slate-100">
                    <ResearchInsight {...RESEARCH_INSIGHTS.practiceEngine} />
                  </div>

                  <div className="pt-2">
                    <PracticeEngine 
                      version="website" 
                      playTick={playTick} 
                      onLaunchFullApp={() => {
                        if (onSelectApp) onSelectApp('companion');
                        if (onNavigateToTab) onNavigateToTab('workspace');
                      }} 
                      onNavigateToFramework={() => {
                        handleSelectNavSubItem('what-is-second-thought', 'st-framework', 'The Second Thought Framework');
                      }}
                    />
                  </div>

                </div>
              )}

              {/* PAUSE AND BREATHE VIEW */}
              {beginCardSelection === 'pause' && (
                <div className="space-y-4" id="st-begin-pause-view">
                  <button
                    onClick={() => setBeginCardSelection('none')}
                    className="px-3.5 py-1.5 rounded-xl border border-[#1B0A3B]/20 dark:border-slate-700 hover:border-[#1B0A3B]/60 text-xs font-semibold text-[#1B0A3B] dark:text-slate-100 flex items-center gap-2 cursor-pointer transition-colors bg-[#1B0A3B]/5 dark:bg-slate-800"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back to How do I begin</span>
                  </button>

                  <PauseAndBreatheMenu
                    soundEnabled={settings?.soundEnabled ?? true}
                    reducedMotion={settings?.reducedMotion ?? false}
                    fontSize={settings?.fontSize ?? 'standard'}
                  />
                </div>
              )}
            </div>
          )}

          {/* PAGE: PAUSE & BREATHE */}
          {activeCategoryId === 'pause-and-breathe' && (
            <div className="space-y-8" id="st-pause-breathe-page-view">
              <div className="max-w-3xl mx-auto text-[#1B0A3B] dark:text-slate-100">
                <ResearchInsight {...RESEARCH_INSIGHTS.pauseAndBreathe} />
              </div>

              <PauseAndBreatheMenu
                soundEnabled={settings?.soundEnabled ?? true}
                reducedMotion={settings?.reducedMotion ?? false}
                fontSize={settings?.fontSize ?? 'standard'}
              />

            </div>
          )}

          {/* PAGE 5: IN PRACTICE / THE SECOND THOUGHT ECOSYSTEM */}
          {activeCategoryId === 'in-practice' && (
            <div className="space-y-8 text-left text-[#1B0A3B] dark:text-slate-100" id="st-in-practice-page-view">
              <button
                type="button"
                onClick={navigateToReadyLanding}
                className="inline-flex items-center gap-2 font-bold hover:underline cursor-pointer text-sm sm:text-base text-[#1B0A3B]"
              >
                <ArrowLeft className="w-4 h-4 shrink-0" />
                <span>Back to I’m ready</span>
              </button>
              
              {activeSubItemDetailId ? (() => {
                const currentSub = websiteNavHierarchy.flatMap(c => c.subItems || []).find(s => s.id === activeSubItemDetailId);
                if (!currentSub) return null;

                return (
                  <div className="space-y-8 text-left text-[#1B0A3B] dark:text-slate-100" id="st-eco-detail-view">
                    <div className="flex items-center justify-between border-b border-[#1B0A3B]/10 dark:border-slate-800 pb-4">
                      <button
                        onClick={() => {
                          setActiveSubItemDetailId(null);
                          if (playTick) playTick(450, 0.05);
                        }}
                        className="inline-flex items-center gap-2 font-bold hover:underline cursor-pointer text-sm sm:text-base"
                        style={{ color: BURGUNDY }}
                      >
                        <ArrowLeft className="w-4 h-4 shrink-0" />
                        <span>Back to {cmsText('nav.category.in-practice.title', 'The Second Thought Ecosystem')}</span>
                      </button>

                      <button
                        onClick={() => {
                          setActiveSubItemDetailId(null);
                          if (playTick) playTick(450, 0.05);
                        }}
                        className="st-action-burgundy inline-flex items-center gap-1 font-bold hover:underline cursor-pointer text-xs sm:text-sm"
                        style={{ color: BURGUNDY }}
                      >
                        <span>See less</span>
                        <ChevronUp className="w-4 h-4 shrink-0" />
                      </button>
                    </div>

                    <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1B0A3B] dark:text-slate-100">
                      {currentSub.title}
                    </h2>

                    {currentSub.id === 'st-framework' || currentSub.id === 'ip-framework' ? (
                      <div className="space-y-6">
                        {/* 2nd layer paragraph */}
                        <p className="text-base sm:text-lg leading-relaxed font-normal text-[#1B0A3B] dark:text-slate-100 opacity-95">
                          The Second Thought Framework is a reflective practice for individuals, organisations, communities, and systems.
                        </p>

                        <ResearchInsight {...RESEARCH_INSIGHTS.framework} />

                        {/* Interactive framework sections - Look, Ask, Think a Second Time as plus / minus progressive disclosure */}
                        <div className="space-y-2 pt-4 border-t border-[#1B0A3B]/10 dark:border-slate-800">
                          {currentSub.layer2.sections.slice(0, 3).map((sec, idx) => {
                            const isExpanded = !!expandedFrameworkSections[idx];
                            return (
                              <div key={idx} className="text-left py-1">
                                <button
                                  onClick={() => toggleFrameworkSection(idx)}
                                  className="w-full text-left flex items-center justify-between gap-3 font-bold text-base sm:text-lg text-[#1B0A3B] dark:text-slate-100 hover:opacity-80 transition-opacity cursor-pointer group py-1"
                                  aria-expanded={isExpanded}
                                >
                                  <span className="leading-snug font-bold">{sec.heading}</span>
                                  <div
                                    className="flex items-center justify-center shrink-0 p-1 opacity-80 hover:opacity-100 transition-opacity"
                                    style={{ color: BURGUNDY }}
                                    aria-label={isExpanded ? 'Collapse' : 'Expand'}
                                  >
                                    {isExpanded ? <Minus className="w-5 h-5 shrink-0 text-[#912A4A]" /> : <Plus className="w-5 h-5 shrink-0 text-[#912A4A]" />}
                                  </div>
                                </button>

                                {isExpanded && (
                                  <div className="pl-1 pr-2 pt-2 pb-3">
                                    {renderLongFormBody(sec.body, 'text-sm sm:text-base leading-relaxed opacity-90 text-[#1B0A3B] dark:text-slate-100 font-normal')}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>

                        {/* Practice & Repetition, Applications as standard non-collapsible sections */}
                        {currentSub.layer2.sections.length > 3 && (
                          <div className="space-y-6 pt-6 border-t border-[#1B0A3B]/10 dark:border-slate-800 text-sm sm:text-base leading-relaxed opacity-90 text-[#1B0A3B] dark:text-slate-100">
                            {currentSub.layer2.sections.slice(3).map((sec, idx) => (
                              <div key={idx} className="space-y-2">
                                {sec.heading && (
                                  <h3 className="text-lg sm:text-xl font-bold text-[#1B0A3B] dark:text-slate-100">
                                    {sec.heading}
                                  </h3>
                                )}
                                {renderLongFormBody(sec.body, 'text-sm sm:text-base leading-relaxed opacity-90')}
                              </div>
                            ))}
                          </div>
                        )}

                      </div>
                    ) : (
                      <div className="space-y-6">
                        <div className="text-base sm:text-lg leading-relaxed font-medium text-[#1B0A3B] dark:text-slate-100 opacity-95 whitespace-pre-line">
                          {currentSub.layer1.orientation}
                        </div>

                        {RESEARCH_INSIGHTS[currentSub.id] && (
                          <ResearchInsight {...RESEARCH_INSIGHTS[currentSub.id]} />
                        )}

                        {/* Layer 2 sections as plus / minus progressive disclosure, matching the Framework pattern, to reduce cognitive load on dense reference pages */}
                        <div className="space-y-2 pt-4 border-t border-[#1B0A3B]/10 dark:border-slate-800">
                          {currentSub.layer2.sections.map((sec, idx) => {
                            const sectionKey = `${currentSub.id}-${idx}`;
                            const isExpanded = !!expandedEcosystemSections[sectionKey];
                            return (
                              <div key={idx} className="text-left py-1">
                                <button
                                  onClick={() => toggleEcosystemSection(sectionKey)}
                                  className="w-full text-left flex items-center justify-between gap-3 font-bold text-base sm:text-lg text-[#1B0A3B] dark:text-slate-100 hover:opacity-80 transition-opacity cursor-pointer group py-1"
                                  aria-expanded={isExpanded}
                                >
                                  <span className="leading-snug font-bold">{sec.heading}</span>
                                  <div
                                    className="flex items-center justify-center shrink-0 p-1 opacity-80 hover:opacity-100 transition-opacity"
                                    style={{ color: BURGUNDY }}
                                    aria-label={isExpanded ? 'Collapse' : 'Expand'}
                                  >
                                    {isExpanded ? <Minus className="w-5 h-5 shrink-0 text-[#912A4A]" /> : <Plus className="w-5 h-5 shrink-0 text-[#912A4A]" />}
                                  </div>
                                </button>

                                {isExpanded && (
                                  <div className="pl-1 pr-2 pt-2 pb-3">
                                    {renderLongFormBody(sec.body, 'text-sm sm:text-base leading-relaxed opacity-90 text-[#1B0A3B] dark:text-slate-100 font-normal')}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>

                        {currentSub.layer2.quote && (
                          <div className="pt-2 text-sm sm:text-base opacity-85 border-l-2 pl-4 border-[#912A4A]">
                            {currentSub.layer2.quote}
                          </div>
                        )}

                      </div>
                    )}

                    <div className="pt-8 border-t border-[#1B0A3B]/10 dark:border-slate-800 flex justify-end">
                      <button
                        onClick={() => {
                          setActiveSubItemDetailId(null);
                          if (playTick) playTick(480, 0.05);
                        }}
                        className="st-action-burgundy inline-flex items-center gap-1.5 font-bold hover:underline cursor-pointer text-sm sm:text-base"
                        style={{ color: BURGUNDY }}
                      >
                        <span>See less</span>
                        <ChevronUp className="w-4 h-4 shrink-0" />
                      </button>
                    </div>
                  </div>
                );
              })() : (
                <div className="space-y-8" id="st-eco-overview">
                  <div className="border-b border-[#1B0A3B]/10 dark:border-slate-800 pb-4 space-y-2">
                    <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#1B0A3B] dark:text-slate-100" id="st-page-main-heading">
                      {cmsText('nav.category.in-practice.title', 'The Second Thought Ecosystem')}
                    </h2>
                    <p className="text-xs sm:text-sm opacity-80 leading-relaxed text-[#1B0A3B] dark:text-slate-200">
                      {cmsText('ready.ecosystem.description', 'Practice Framework, Apps, Publications, and Research for Second Thought.')}
                    </p>
                  </div>

                  {/* ECOSYSTEM MAP INTERACTIVE VISUALIZATION */}
                  <div className="p-4 sm:p-6 rounded-2xl border border-[#1B0A3B]/15 dark:border-slate-800 bg-[#1B0A3B]/[0.01]">
                    <EcosystemMap 
                      onSelectNode={handleEcosystemNodeSelect}
                      activeNodeId={activeSubItemId}
                    />
                  </div>

                  {/* CORE ECOSYSTEM CARDS */}
                  <div className="flex flex-col sm:flex-row sm:items-stretch" id="st-in-practice-cards-grid">
                    {(websiteNavHierarchy.find(c => c.id === 'in-practice')?.subItems || []).map((sub, index) => {
                      const isFramework = sub.id === 'ip-framework';
                      return (
                        <React.Fragment key={sub.id}>
                          {index > 0 && (
                            <>
                              <div aria-hidden="true" className="hidden sm:block w-[2px] bg-[#912A4A] self-stretch my-12" />
                              <div aria-hidden="true" className="sm:hidden h-[2px] bg-[#912A4A] w-full my-10" />
                            </>
                          )}
                        <div 
                          id={`st-ip-card-${sub.id}`}
                          className={`flex-1 px-6 md:px-10 py-5 transition-colors flex flex-col justify-between space-y-4 text-left`}
                        >
                          <div className="space-y-3 flex-1 flex flex-col justify-start">
                            <h3 className="text-lg sm:text-xl font-bold tracking-tight text-[#1B0A3B] dark:text-slate-100 flex items-center gap-2">
                              {isFramework && <Compass className="w-5 h-5 text-[#912A4A] shrink-0" />}
                              <span>{sub.title}</span>
                            </h3>

                            <p className="text-xs sm:text-sm opacity-90 leading-relaxed text-[#1B0A3B] dark:text-slate-100 whitespace-pre-line">
                              {sub.layer1.orientation}
                            </p>
                          </div>

                          <div className="pt-2 flex items-center justify-between">
                            <button
                              onClick={() => {
                                setActiveSubItemDetailId(sub.id);
                                if (playTick) playTick(520, 0.05);
                              }}
                              className="st-action-burgundy inline-flex items-center gap-1.5 font-bold hover:underline cursor-pointer text-xs sm:text-sm"
                              style={{ color: BURGUNDY }}
                            >
                              <span>Find out more</span>
                              <ArrowRight className="w-3.5 h-3.5 shrink-0" />
                            </button>

                          </div>
                        </div>
                          </React.Fragment>
                      );
                    })}
                  </div>
                </div>
              )}

            </div>
          )}

        </main>

        {/* TRUST AND GOVERNANCE LAYER FOOTER */}
        <div className="md:col-span-12 w-full" id="st-footer-grid-row">
          <TrustFooter 
            playTick={playTick} 
            onOpenAccessibilityPanel={() => {
              if (onNavigateToTab) onNavigateToTab('accessibility');
            }} 
          />
        </div>

      </div>

      {/* RESOURCE PREVIEW MODAL */}
      {previewResource && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4" id="st-resource-modal-overlay">
          <div className="bg-background border border-current/20 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl text-left" id="st-resource-modal-card">
            <div className="flex justify-between items-center border-b border-current/10 pb-3" id="st-resource-modal-hdr">
              <h4 className="text-base font-semibold" id="st-resource-modal-title">{previewResource.title}</h4>
              <button 
                onClick={() => setPreviewResource(null)}
                className="text-xs opacity-60 hover:opacity-100 cursor-pointer font-semibold"
                id="st-resource-modal-close"
              >
                Close
              </button>
            </div>
            <p className="text-xs opacity-80 leading-normal" id="st-resource-modal-desc">{previewResource.description}</p>
            {previewResource.contentSnippet && (
              <pre className="p-3 rounded-lg bg-current/5 border border-current/10 text-[11px] font-mono whitespace-pre-wrap overflow-x-auto max-h-60" id="st-resource-modal-snippet">
                {previewResource.contentSnippet}
              </pre>
            )}
            <div className="flex justify-end gap-2 pt-2" id="st-resource-modal-actions">
              <button
                onClick={() => setPreviewResource(null)}
                className="px-4 py-2 rounded-lg border border-current/20 text-xs font-medium cursor-pointer"
                id="st-resource-modal-cancel"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
