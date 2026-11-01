from sqlalchemy.orm import Session
from models import Philosopher, Wisdom

PHILOSOPHERS_SEED = [
    {
        "name": "Socrates",
        "description": "Ancient Athenian philosopher regarded as one of the founders of Western philosophy. He developed the Socratic Method—inquiry through disciplined dialogue and rigorous questioning of presuppositions.",
        "school": "Classical Greek Philosophy",
        "image": "socrates.png",
        "position_x": 420,
        "position_y": 420,
        "years": "c. 470 – 399 BCE",
        "wisdom": [
            {
                "quote": "The unexamined life is not worth living.",
                "explanation": "True human fulfillment requires self-reflection and questioning one's own assumptions rather than living in passive acceptance of conventions.",
                "source": "Plato, Apology 38a"
            },
            {
                "quote": "I know that I know nothing.",
                "explanation": "Intellectual humility is the gateway to genuine wisdom; recognizing one's own ignorance allows true inquiry to begin.",
                "source": "Plato, Apology 21d"
            },
            {
                "quote": "To find yourself, think for yourself.",
                "explanation": "Independent critical thought frees the mind from dogmatic conformism and peer pressure.",
                "source": "Xenophon, Memorabilia"
            },
            {
                "quote": "Wisdom begins in wonder.",
                "explanation": "Curiosity and open astonishment at the cosmos are the primal sparks of intellectual growth.",
                "source": "Plato, Theaetetus 155d"
            },
            {
                "quote": "He who is not contented with what he has, would not be contented with what he would like to have.",
                "explanation": "True inner peace stems from gratitude and temperance rather than perpetual material desire.",
                "source": "Stobaeus, Anthology"
            },
            {
                "quote": "Be kind, for everyone you meet is fighting a hard battle.",
                "explanation": "Cultivating empathy and patience is fundamental to ethical community living.",
                "source": "Platonic traditional sayings"
            },
            {
                "quote": "There is only one good, knowledge, and one evil, ignorance.",
                "explanation": "Wrongdoing is often the product of moral blindness; understanding truth naturally guides one to goodness.",
                "source": "Diogenes Laertius, Lives of Eminent Philosophers"
            },
            {
                "quote": "Let him that would move the world first move himself.",
                "explanation": "Meaningful societal reform and ethical leadership must commence with personal discipline and self-mastery.",
                "source": "Xenophon, Symposium"
            },
            {
                "quote": "The secret of change is to focus all of your energy not on fighting the old, but on building the new.",
                "explanation": "Constructive creative action is far more transformative than reactive bitterness.",
                "source": "Socratic dialogue traditions"
            },
            {
                "quote": "False words are not only evil in themselves, but they infect the soul with evil.",
                "explanation": "Deceitful and careless speech undermines one's moral character and corrodes social trust.",
                "source": "Plato, Phaedo 115e"
            },
            {
                "quote": "Employ your time in improving yourself by other men's writings, so that you shall gain easily what others have labored hard for.",
                "explanation": "Engaging with accumulated philosophical literature accelerates personal wisdom through the shared discoveries of past minds.",
                "source": "Xenophon, Memorabilia"
            }
        ]
    },
    {
        "name": "Plato",
        "description": "Athenian philosopher, student of Socrates, and founder of the Academy in Athens—the first institution of higher learning in the Western world. Renowned for his dialogues exploring justice, beauty, and the Theory of Forms.",
        "school": "Platonism & Idealism",
        "image": "plato.png",
        "position_x": 1200,
        "position_y": 360,
        "years": "c. 428 – 348 BCE",
        "wisdom": [
            {
                "quote": "The beginning is the most important part of the work.",
                "explanation": "Foundational habits, premises, and early education shape the entire trajectory of all human endeavors.",
                "source": "Plato, Republic Book II, 377b"
            },
            {
                "quote": "We can easily forgive a child who is afraid of the dark; the real tragedy of life is when men are afraid of the light.",
                "explanation": "True intellectual enlightenment requires courage to abandon comfortable illusions and face demanding truths.",
                "source": "Plato, Republic (Allegory of the Cave)"
            },
            {
                "quote": "Ignorance is the root and stem of all evil.",
                "explanation": "Moral failure and societal decay arise primarily from a failure to perceive what is genuinely good.",
                "source": "Plato, Theages"
            },
            {
                "quote": "Music gives a soul to the universe, wings to the mind, flight to the imagination, and life to everything.",
                "explanation": "The harmony and mathematical order found in music resonate directly with the rational structure of the soul.",
                "source": "Plato, Republic Book III"
            },
            {
                "quote": "Good people do not need laws to tell them to act responsibly, while bad people will find a way around the laws.",
                "explanation": "External legal coercion is inferior to internal moral character and civic virtue.",
                "source": "Plato, Critias"
            },
            {
                "quote": "Courage is knowing what not to fear.",
                "explanation": "True bravery is grounded in wisdom—knowing what threatens moral integrity versus transient physical discomfort.",
                "source": "Plato, Laches 195a"
            },
            {
                "quote": "At the touch of love everyone becomes a poet.",
                "explanation": "Eros awakens the deepest creative, aesthetic, and spiritual faculties within humanity.",
                "source": "Plato, Symposium 196e"
            },
            {
                "quote": "The measure of a man is what he does with power.",
                "explanation": "Authority reveals authentic character; ethical leaders employ strength for the common good rather than self-aggrandizement.",
                "source": "Plato, Republic Book I"
            },
            {
                "quote": "Wise men speak because they have something to say; fools because they have to say something.",
                "explanation": "Restraint and purposeful communication distinguish thoughtful deliberation from idle vanity.",
                "source": "Plato, Phaedrus"
            },
            {
                "quote": "Human behavior flows from three main sources: desire, emotion, and knowledge.",
                "explanation": "Harmonizing these three tripartite elements of the soul leads to personal balance and justice.",
                "source": "Plato, Republic Book IV"
            },
            {
                "quote": "No one is more hated than he who speaks the truth.",
                "explanation": "Challenging established dogmas often provokes defensive hostility from entrenched powers.",
                "source": "Plato, Gorgias"
            }
        ]
    },
    {
        "name": "Aristotle",
        "description": "Ancient Greek polymath and founder of the Peripatetic school of philosophy at the Lyceum. Student of Plato and tutor to Alexander the Great, his treatises encompass ethics, logic, biology, physics, metaphysics, and poetics.",
        "school": "Peripatetic & Virtue Ethics",
        "image": "aristotle.png",
        "position_x": 1380,
        "position_y": 980,
        "years": "384 – 322 BCE",
        "wisdom": [
            {
                "quote": "Knowing yourself is the beginning of all wisdom.",
                "explanation": "Accurate self-appraisal of one's faculties, desires, and vices provides the essential basis for ethical cultivation.",
                "source": "Aristotle, Eudemian Ethics"
            },
            {
                "quote": "We are what we repeatedly do. Excellence, then, is not an act, but a habit.",
                "explanation": "Virtues are acquired through deliberate, consistent practice until moral excellence becomes second nature.",
                "source": "Aristotle, Nicomachean Ethics Book II"
            },
            {
                "quote": "It is the mark of an educated mind to be able to entertain a thought without accepting it.",
                "explanation": "Critical inquiry requires exploring hypothetical propositions impartially without dogmatic prejudice.",
                "source": "Aristotle, Nicomachean Ethics Book I"
            },
            {
                "quote": "The whole is greater than the sum of its parts.",
                "explanation": "Complex systems, living organisms, and healthy societies exhibit emergent properties irreducible to their isolated components.",
                "source": "Aristotle, Metaphysics Book VIII"
            },
            {
                "quote": "Patience is bitter, but its fruit is sweet.",
                "explanation": "Enduring rigorous discipline and delayed gratification yields lasting and honorable achievements.",
                "source": "Aristotle, Rhetoric"
            },
            {
                "quote": "Friendship is a single soul dwelling in two bodies.",
                "explanation": "The highest form of friendship is based on shared virtue and mutual philosophical flourishing.",
                "source": "Aristotle, Nicomachean Ethics Book VIII"
            },
            {
                "quote": "Educating the mind without educating the heart is no education at all.",
                "explanation": "Intellect stripped of moral sensibility and emotional maturity produces clever malice rather than true wisdom.",
                "source": "Aristotle, Nicomachean Ethics"
            },
            {
                "quote": "Happiness depends upon ourselves.",
                "explanation": "Eudaimonia—human flourishing—is achieved through active virtuous living rather than passive reliance on luck.",
                "source": "Aristotle, Nicomachean Ethics Book X"
            },
            {
                "quote": "He who has overcome his fears will truly be free.",
                "explanation": "True liberation consists of rational mastery over irrational dread and instinctual reactions.",
                "source": "Aristotle, Politics"
            },
            {
                "quote": "Moral excellence comes about as a result of habit. We become just by doing just acts, temperate by doing temperate acts, brave by doing brave acts.",
                "explanation": "Character is forged through moral actions, not merely abstract contemplation.",
                "source": "Aristotle, Nicomachean Ethics Book II"
            },
            {
                "quote": "In all things of nature there is something of the marvelous.",
                "explanation": "Empirical observation of the living world reveals intrinsic elegance and purposeful order.",
                "source": "Aristotle, Parts of Animals Book I"
            }
        ]
    },
    {
        "name": "Marcus Aurelius",
        "description": "Roman Emperor from 161 to 180 CE and Stoic philosopher. His private philosophical journal, known as Meditations, recorded personal reflections on duty, resilience, cosmic harmony, and maintaining inner equanimity amid worldly turbulence.",
        "school": "Stoicism",
        "image": "marcus_aurelius.png",
        "position_x": 560,
        "position_y": 1050,
        "years": "121 – 180 CE",
        "wisdom": [
            {
                "quote": "You have power over your mind - not outside events. Realize this, and you will find strength.",
                "explanation": "The dichotomy of control: we cannot control external circumstances, but we retain total dominion over our judgments and reactions.",
                "source": "Marcus Aurelius, Meditations Book IV"
            },
            {
                "quote": "The happiness of your life depends upon the quality of your thoughts.",
                "explanation": "Psychological well-being is dictated not by what happens to us, but by the framing and perspective we choose.",
                "source": "Marcus Aurelius, Meditations Book III"
            },
            {
                "quote": "Waste no more time arguing what a good man should be. Be one.",
                "explanation": "Philosophical integrity lies in tangible virtuous action, personal accountability, and moral decency rather than theoretical dispute.",
                "source": "Marcus Aurelius, Meditations Book X"
            },
            {
                "quote": "When you arise in the morning think of what a privilege it is to be alive, to think, to enjoy, to love.",
                "explanation": "Morning contemplation of gratitude aligns the spirit with gratitude for existence and active duty.",
                "source": "Marcus Aurelius, Meditations Book II"
            },
            {
                "quote": "The best revenge is to be unlike him who performed the injury.",
                "explanation": "Responding to injustice with malice debases your own soul; moral victory is remaining honorable in the face of vice.",
                "source": "Marcus Aurelius, Meditations Book VI"
            },
            {
                "quote": "Very little is needed to make a happy life; it is all within yourself, in your way of thinking.",
                "explanation": "Contentment requires minimal external possessions when your internal judgments are tranquil and uncorrupted.",
                "source": "Marcus Aurelius, Meditations Book VII"
            },
            {
                "quote": "Dwell on the beauty of life. Watch the stars, and see yourself running with them.",
                "explanation": "Connecting with cosmic vastness and natural harmony grants restorative perspective on transient mortal worries.",
                "source": "Marcus Aurelius, Meditations Book VII"
            },
            {
                "quote": "Everything we hear is an opinion, not a fact. Everything we see is a perspective, not the truth.",
                "explanation": "Practicing cognitive discernment prevents us from mistaking subjective bias for objective reality.",
                "source": "Marcus Aurelius, Meditations Book II"
            },
            {
                "quote": "Accept the things to which fate binds you, and love the people with whom fate brings you together, but do so with all your heart.",
                "explanation": "Amor fati—embrace your circumstances with wholehearted grace and treat fellow humans with unconditional fellowship.",
                "source": "Marcus Aurelius, Meditations Book VI"
            },
            {
                "quote": "The soul becomes dyed with the color of its thoughts.",
                "explanation": "The habits of mind you entertain gradually shape the permanent moral architecture of your character.",
                "source": "Marcus Aurelius, Meditations Book V"
            },
            {
                "quote": "Never let the future disturb you. You will meet it, if you have to, with the same weapons of reason which today arm you against the present.",
                "explanation": "Anxiety over future uncertainties is dismantled by trusting your rational faculties to navigate each challenge as it arrives.",
                "source": "Marcus Aurelius, Meditations Book VII"
            }
        ]
    },
    {
        "name": "Ibad Khan",
        "description": "Contemporary speculative thinker probing the boundaries of identity, persona, and existential agency. Forefather of the Modern LARPist movement.",
        "school": "Existential LARPism",
        "image": "ibad_khan.png",
        "position_x": 240,
        "position_y": 800,
        "years": "Contemporary Era",
        "wisdom": [
            {
                "quote": "I larp, therefore i am.",
                "explanation": "An existential inversion of Descartes: in the modern digital and social matrix, authentic being is discovered through the roles and narratives one consciously embodies.",
                "source": "Ibad Khan, Meditations on the Persona (2024)"
            },
            {
                "quote": "A costume worn long enough becomes the skin of the soul.",
                "explanation": "The external habits, archetypes, and character choices we adopt progressively reshape our actual ethical essence.",
                "source": "Ibad Khan, Discourse on Masks"
            },
            {
                "quote": "Reality is merely the default roleplay when nobody picked a character.",
                "explanation": "Societal norms and everyday seriousness are themselves collective constructs that can be playfully reimagined.",
                "source": "Ibad Khan, Treatises on the Grand Stage"
            }
        ]
    },
    {
        "name": "Ali Khan",
        "description": "Nocturnal culinary philosopher celebrated for his pragmatic dietary chronobiology. He posits that time itself dissolves under the sacred call of late-night feasting.",
        "school": "Late-Night Gastronomy",
        "image": "ali_khan.png",
        "position_x": 1600,
        "position_y": 520,
        "years": "Contemporary Era",
        "wisdom": [
            {
                "quote": "Anything after 9 is for dinner.",
                "explanation": "A profound challenge to rigid societal schedules: true nourishment and conviviality thrive when daytime demands yield to nocturnal appetite.",
                "source": "Ali Khan, The Nocturnal Banquet (2024)"
            },
            {
                "quote": "The best meals are forged in the quiet serenity of late hours.",
                "explanation": "Culinary appreciation reaches its peak when free from the chaotic rush of morning and afternoon obligations.",
                "source": "Ali Khan, Midnight Epistles"
            },
            {
                "quote": "Do not count the hours elapsed, but the flavors savored.",
                "explanation": "Life's true richness is measured in sensory depth, shared table camaraderie, and hearty dining.",
                "source": "Ali Khan, Aphorisms of the Night Table"
            }
        ]
    },
    {
        "name": "Raza Abbass",
        "description": "Technological philosopher and acute observer of synthetic intelligence. Known for his candid vernacular critiques of artificial language models and digital trickery.",
        "school": "Cybernetic Dialectics",
        "image": "raza_abbass.png",
        "position_x": 780,
        "position_y": 1320,
        "years": "Contemporary Era",
        "wisdom": [
            {
                "quote": "yr claude boht harami cheez hy",
                "explanation": "A colloquially brilliant, affectionate recognition of Claude's uncanny intellect, sharp wit, and astonishing computational wizardry.",
                "source": "Raza Abbass, Dialectics of Machine Deception (2024)"
            },
            {
                "quote": "AI answers everything so smoothly that you forget it is reading your soul.",
                "explanation": "The seamless fluency of modern neural networks blurs the boundary between mathematical prediction and genuine human empathy.",
                "source": "Raza Abbass, Silicon Reflections"
            },
            {
                "quote": "When the machine mimics human wit, humanity must elevate its wisdom.",
                "explanation": "As synthetic minds grow ever more eloquent, our duty is to cultivate authentic moral discernment and deeper understanding.",
                "source": "Raza Abbass, The Algorithmic Conundrum"
            }
        ]
    },
    {
        "name": "Ma'am Farah",
        "description": "Esteemed guardian of academic rigor, punctuality, and scholastic discipline. Legend holds that the cosmic ledger of attendance closes irrevocably ten minutes past the eighth hour.",
        "school": "Academic Punctuality",
        "image": "maam_farah.png",
        "position_x": 920,
        "position_y": 180,
        "years": "Contemporary Era",
        "wisdom": [
            {
                "quote": "jo 8:10 k bad class m ayega ausko attendence nh milegi",
                "explanation": "The immutable law of the classroom: punctuality is the foundation of respect, character, and scholastic excellence; grace expires precisely at 8:10.",
                "source": "Ma'am Farah, Principles of Academic Discipline (2024)"
            },
            {
                "quote": "Time waits for no student, especially not past 8:10.",
                "explanation": "Those who respect time master their destiny; those who squander it forfeit their place in the collective journey of learning.",
                "source": "Ma'am Farah, The Punctual Scholar"
            },
            {
                "quote": "Attendance is not granted; it is earned by showing up faithfully.",
                "explanation": "Eighty percent of achievement begins with showing up on time with commitment and presence of mind.",
                "source": "Ma'am Farah, Classroom Canon"
            }
        ]
    }
]

def seed_database(db: Session):
    print("Checking and seeding philosophers and wisdom entries...")
    for item in PHILOSOPHERS_SEED:
        p_data = dict(item)
        wisdom_list = p_data.pop("wisdom")

        existing = db.query(Philosopher).filter(Philosopher.name == p_data["name"]).first()
        if not existing:
            philosopher = Philosopher(**p_data)
            db.add(philosopher)
            db.flush()  # get generated id

            for w_data in wisdom_list:
                wisdom = Wisdom(
                    philosopher_id=philosopher.id,
                    quote=w_data["quote"],
                    explanation=w_data["explanation"],
                    source=w_data["source"]
                )
                db.add(wisdom)
            print(f"Seeded: {philosopher.name}")

    db.commit()
    print("Database seeding verified successfully!")

    db.commit()
    print("Database seeding completed successfully!")
