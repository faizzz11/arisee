
"use client";

import { Footer } from "@/components/Footer";
import { HeroSection } from "@/components/blocks/hero-section-3"
import { Pricing } from "@/components/blocks/pricing";
import { HeroVideoDialog } from "@/components/ui/hero-video-dialog"
import FaqSection from "@/components/blocks/faq-section"
import { WorldMap } from "@/components/blocks/world-map";
import { motion } from "framer-motion";
import {
  BellIcon,
  CalendarIcon,
  FileTextIcon,
  GlobeIcon,
  InputIcon,
} from "@radix-ui/react-icons";

import { BentoCard, BentoGrid } from "@/components/ui/bento-grid";
import { TestimonialsColumn } from "@/components/blocks/testimonials-coulmn-1";

const testimonials = [
  {
    text: "This ERP revolutionized our operations, streamlining finance and inventory. The cloud-based platform keeps us productive, even remotely.",
    image: "https://randomuser.me/api/portraits/women/1.jpg",
    name: "Briana Patton",
    role: "Operations Manager",
  },
  {
    text: "Implementing this ERP was smooth and quick. The customizable, user-friendly interface made team training effortless.",
    image: "https://randomuser.me/api/portraits/men/2.jpg",
    name: "Bilal Ahmed",
    role: "IT Manager",
  },
  {
    text: "The support team is exceptional, guiding us through setup and providing ongoing assistance, ensuring our satisfaction.",
    image: "https://randomuser.me/api/portraits/women/3.jpg",
    name: "Saman Malik",
    role: "Customer Support Lead",
  },
  {
    text: "This ERP's seamless integration enhanced our business operations and efficiency. Highly recommend for its intuitive interface.",
    image: "https://randomuser.me/api/portraits/men/4.jpg",
    name: "Omar Raza",
    role: "CEO",
  },
  {
    text: "Its robust features and quick support have transformed our workflow, making us significantly more efficient.",
    image: "https://randomuser.me/api/portraits/women/5.jpg",
    name: "Zainab Hussain",
    role: "Project Manager",
  },
  {
    text: "The smooth implementation exceeded expectations. It streamlined processes, improving overall business performance.",
    image: "https://randomuser.me/api/portraits/women/6.jpg",
    name: "Aliza Khan",
    role: "Business Analyst",
  },
  {
    text: "Our business functions improved with a user-friendly design and positive customer feedback.",
    image: "https://randomuser.me/api/portraits/men/7.jpg",
    name: "Farhan Siddiqui",
    role: "Marketing Director",
  },
  {
    text: "They delivered a solution that exceeded expectations, understanding our needs and enhancing our operations.",
    image: "https://randomuser.me/api/portraits/women/8.jpg",
    name: "Sana Sheikh",
    role: "Sales Manager",
  },
  {
    text: "Using this ERP, our online presence and conversions significantly improved, boosting business performance.",
    image: "https://randomuser.me/api/portraits/men/9.jpg",
    name: "Hassan Ali",
    role: "E-commerce Manager",
  },
];


const firstColumn = testimonials.slice(0, 3);
const secondColumn = testimonials.slice(3, 6);
const thirdColumn = testimonials.slice(6, 9);

export default function Home() {
  return (
    <>
      <div className="mb-10">

        {/* <Navbar /> */}
        <HeroSection />
        <div className="relative flex justify-center items-center py-8">
          <div className="backdrop-blur-sm bg-gray-500/20 dark:bg-gray-800/30 border border-gray-400/30 dark:border-gray-600/30 rounded-2xl p-6 shadow-xl">
            <HeroVideoDialog
              className="dark:hidden block"
              animationStyle="from-center"
              videoSrc="https://www.youtube.com/embed/2Dtn_2mH9ek"
              thumbnailSrc="/ariseui.png"
              thumbnailAlt="Hero Video"
            />
            <HeroVideoDialog
              className="hidden dark:block"
              animationStyle="from-center"
              videoSrc="https://www.youtube.com/embed/2Dtn_2mH9ek"
              thumbnailSrc="/ariseui.png"
              thumbnailAlt="Hero Video"
            />
          </div>
        </div>
        <div className=" py-40 dark:bg-black bg-white">
          <div className="max-w-7xl mx-auto text-center">
            <p className="font-bold text-xl md:text-4xl dark:text-white text-black">
              Global{" "}
              <span className="text-neutral-400">
                {"Education".split("").map((word, idx) => (
                  <motion.span
                    key={idx}
                    className="inline-block"
                    initial={{ x: -10, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.5, delay: idx * 0.04 }}
                  >
                    {word}
                  </motion.span>
                ))}
              </span>
            </p>
            <p className="text-sm md:text-lg text-neutral-500 max-w-2xl mx-auto py-4">
              Connect educators and students worldwide. ARISE empowers learning communities across continents, breaking geographical barriers in education with AI-powered tools.
            </p>
          </div>
          <div className="flex justify-center items-center">
            <WorldMap
              dots={[
                {
                  start: {
                    lat: 64.2008,
                    lng: -149.4937,
                  }, // Alaska (Fairbanks)
                  end: {
                    lat: 34.0522,
                    lng: -118.2437,
                  }, // Los Angeles
                },
                {
                  start: { lat: 64.2008, lng: -149.4937 }, // Alaska (Fairbanks)
                  end: { lat: -15.7975, lng: -47.8919 }, // Brazil (Brasília)
                },
                {
                  start: { lat: -15.7975, lng: -47.8919 }, // Brazil (Brasília)
                  end: { lat: 38.7223, lng: -9.1393 }, // Lisbon
                },
                {
                  start: { lat: 51.5074, lng: -0.1278 }, // London
                  end: { lat: 28.6139, lng: 77.209 }, // New Delhi
                },
                {
                  start: { lat: 28.6139, lng: 77.209 }, // New Delhi
                  end: { lat: 43.1332, lng: 131.9113 }, // Vladivostok
                },
                {
                  start: { lat: 28.6139, lng: 77.209 }, // New Delhi
                  end: { lat: -1.2921, lng: 36.8219 }, // Nairobi
                },
              ]}
            />
          </div>
        </div>
        <section className="bg-background my-20 relative">

          <div className="container z-10 mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              viewport={{ once: true }}
              className="flex flex-col items-center justify-center max-w-[540px] mx-auto"
            >
              <div className="flex justify-center">
                <div className="border py-1 px-4 rounded-lg">Testimonials</div>
              </div>

              <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold tracking-tighter mt-5">
                What our users say
              </h2>
              <p className="text-center mt-5 opacity-75">
                See what our customers have to say about us.
              </p>
            </motion.div>

            <div className="flex justify-center gap-6 mt-10 [mask-image:linear-gradient(to_bottom,transparent,black_25%,black_75%,transparent)] max-h-[740px] overflow-hidden">
              <TestimonialsColumn testimonials={firstColumn} duration={15} />
              <TestimonialsColumn testimonials={secondColumn} className="hidden md:block" duration={19} />
              <TestimonialsColumn testimonials={thirdColumn} className="hidden lg:block" duration={17} />
            </div>
          </div>
        </section>
        <div className="py-20 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold tracking-tight sm:text-5xl dark:text-white text-black">
                AI-Powered Educational Tools
              </h2>
              <p className="text-muted-foreground text-lg mt-4 max-w-2xl mx-auto">
                Revolutionize your teaching and learning experience with ARISE's comprehensive suite of AI-driven educational tools designed for modern educators and students.
              </p>
            </div>
            <div className="flex justify-center">
              <BentoGrid className="lg:grid-rows-3 max-w-6xl">
                {features.map((feature) => (
                  <BentoCard key={feature.name} {...feature} />
                ))}
              </BentoGrid>
            </div>
          </div>
        </div>
        <Pricing
          plans={demoPlans}
          title="ARISE Coins - Power Your Learning"
          description="Purchase ARISE Coins to unlock premium AI-powered educational features\nGenerate presentations, quizzes, roadmaps and more with our flexible coin system."
        />
        <FaqSection />
      </div>
      <Footer />
    </>
  );
}

const demoPlans = [
  {
    name: "STARTER PACK",
    price: "20",
    yearlyPrice: "20",
    period: "50 Coins",
    features: [
      "5 AI Presentations",
      "10 Quiz Questions",
      "3 Learning Roadmaps",
      "Basic PDF Processing",
      "Community Support",
      "Mobile App Access",
    ],
    description: "Perfect for students getting started",
    buttonText: "Buy Coins",
    href: "/auth/signup",
    isPopular: false,
  },
  {
    name: "POPULAR PACK",
    price: "35",
    yearlyPrice: "35",
    period: "100 Coins",
    features: [
      "15 AI Presentations",
      "25 Quiz Questions",
      "8 Learning Roadmaps",
      "Advanced PDF Processing",
      "Educational Podcasts",
      "Priority Support",
      "Analytics Dashboard",
    ],
    description: "Most popular choice for active learners",
    buttonText: "Buy Coins",
    href: "/auth/signup",
    isPopular: true,
  },
  {
    name: "POWER PACK",
    price: "80",
    yearlyPrice: "80",
    period: "250 Coins",
    features: [
      "50 AI Presentations",
      "75 Quiz Questions",
      "25 Learning Roadmaps",
      "Unlimited PDF Processing",
      "Custom Voice Narration",
      "Advanced Analytics",
      "Team Collaboration",
      "Premium Support",
    ],
    description: "For educators and power users",
    buttonText: "Buy Coins",
    href: "/auth/signup",
    isPopular: false,
  },
];

const features = [
  {
    Icon: FileTextIcon,
    name: "AI Presentation Generator",
    description: "Transform any text or PDF into professional presentations instantly with AI-powered content generation and smart slide layouts.",
    href: "/teacher/ai-ppt",
    cta: "Create Presentations",
    background: <img className="absolute -right-20 -top-20 opacity-60" />,
    className: "lg:row-start-1 lg:row-end-4 lg:col-start-2 lg:col-end-3",
  },
  {
    Icon: InputIcon,
    name: "Question Paper Generator",
    description: "Generate customized question papers with various difficulty levels and question types using advanced AI algorithms.",
    href: "/teacher/ai-paper",
    cta: "Generate Papers",
    background: <img className="absolute -right-20 -top-20 opacity-60" />,
    className: "lg:col-start-1 lg:col-end-2 lg:row-start-1 lg:row-end-3",
  },
  {
    Icon: GlobeIcon,
    name: "Learning Roadmaps",
    description: "Create personalized learning paths and educational roadmaps tailored to individual student needs and goals.",
    href: "/my-roadmap",
    cta: "Build Roadmaps",
    background: <img className="absolute -right-20 -top-20 opacity-60" />,
    className: "lg:col-start-1 lg:col-end-2 lg:row-start-3 lg:row-end-4",
  },
  {
    Icon: CalendarIcon,
    name: "AI Quiz Generation",
    description: "Automatically generate interactive quizzes and assessments from any educational content or curriculum.",
    href: "/dashboard",
    cta: "Create Quizzes",
    background: <img className="absolute -right-20 -top-20 opacity-60" />,
    className: "lg:col-start-3 lg:col-end-3 lg:row-start-1 lg:row-end-2",
  },
  {
    Icon: BellIcon,
    name: "Educational Podcasts",
    description:
      "Convert educational content into engaging audio podcasts with AI-generated narration and natural speech synthesis.",
    href: "/dashboard",
    cta: "Generate Podcasts",
    background: <img className="absolute -right-20 -top-20 opacity-60" />,
    className: "lg:col-start-3 lg:col-end-3 lg:row-start-2 lg:row-end-4",
  },
];
