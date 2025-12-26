"use client";
import React, { useState, Suspense, useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import {
    OrbitControls,
    useGLTF,
    Environment,
    ContactShadows,
    PerspectiveCamera,
    Text,
    Float,
    Html
} from '@react-three/drei';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import * as THREE from 'three';
import { cn } from "@/lib/utils";
import type { ModelType } from '@/types/model';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// Define types for our models
type CategoryKey = 'biology' | 'chemistry' | 'physics';

type ModelsType = {
    [key in CategoryKey]: ModelType[];
};

// Real 3D models data
const models: ModelsType = {
    biology: [
        {
            id: 1,
            title: "Cell Structure",
            description: "Interactive model showing cellular organization and physics",
            thumbnail: "https://media.sketchfab.com/models/28e7f62a753548c2b740936394164ee8/thumbnails/ac3984aad64d40b2a073753350ca7c73/57d80803f1114f5789be81c002c83bd8.jpeg",
            modelPath: "./models/celula.glb",
            scale: 2,
            position: [0, 0, 0],
            facts: [
                {
                    question: "How does osmosis work in cells?",
                    answer: "Osmosis is the movement of water molecules across cell membranes from areas of high water concentration to low water concentration. This process helps maintain cell volume and pressure."
                },
                {
                    question: "What forces hold cell membranes together?",
                    answer: "Cell membranes are held together by hydrophobic interactions between phospholipid tails and hydrophilic interactions between phospholipid heads and water. These forces create a stable bilayer structure."
                }
            ]
        },
        {
            id: 2,
            title: "Human Cell",
            description: "Detailed visualization of a human cell and its organelles",
            thumbnail: "https://thumbs.dreamstime.com/b/internal-structure-animal-cell-d-rendering-section-view-computer-digital-drawing-212501119.jpg",
            modelPath: "./models/human_cell.glb",
            scale: 2,
            position: [0, 0, 0],
            facts: [
                {
                    question: "What are the main parts of a human cell?",
                    answer: "The main parts include the nucleus (contains DNA), mitochondria (energy production), endoplasmic reticulum (protein synthesis), Golgi apparatus (protein packaging), and cell membrane (boundary and protection)."
                },
                {
                    question: "How do cells produce energy?",
                    answer: "Cells produce energy through cellular respiration in the mitochondria. This process converts glucose and oxygen into ATP (energy), carbon dioxide, and water."
                }
            ]
        },
        {
            id: 3,
            title: "Human Heart",
            description: "Detailed 3D model of a realistic human heart showing its complex structure and chambers",
            thumbnail: "https://t4.ftcdn.net/jpg/07/70/59/39/360_F_770593957_BQ29IJjmNH55ogfICunBH3nMeHREjVI0.jpg",
            modelPath: "./models/realistic_human_heart.glb",
            scale: 2,
            position: [0, 0, 0],
            facts: [
                {
                    question: "What are the main chambers of the heart?",
                    answer: "The heart has four main chambers: two upper chambers (atria) and two lower chambers (ventricles). The right atrium and ventricle pump blood to the lungs, while the left atrium and ventricle pump blood to the rest of the body."
                },
                {
                    question: "How does blood flow through the heart?",
                    answer: "Blood flows from the body into the right atrium, then to the right ventricle which pumps it to the lungs. Oxygenated blood returns to the left atrium, flows to the left ventricle, and is pumped to the rest of the body."
                }
            ]
        },
        {
            id: 4,
            title: "Animated Heart",
            description: "Interactive 3D model of a beating human heart showing blood flow and cardiac cycles",
            thumbnail: "https://preview.free3d.com/img/2019/04/2154878575000422342/eg6txyr3.jpg",
            modelPath: "https://sketchfab.com/models/1582359649694207a2ad6bd0ebd0606a/embed",
            scale: 2,
            position: [0, 0, 0],
            isSketchfab: true,
            facts: [
                {
                    question: "How does the heart pump blood?",
                    answer: "The heart pumps blood through coordinated contractions of its four chambers. The atria contract first, followed by the ventricles, creating a rhythmic pumping action that circulates blood throughout the body."
                }
            ]
        },
        {
            id: 5,
            title: "Cerebellum",
            description: "Detailed model of the human cerebellum showing neural connections and structure",
            thumbnail: "https://i0.wp.com/brainmadesimple.com/wp-content/uploads/2019/10/Cerebrum.jpg?fit=1024%2C819&ssl=1",
            modelPath: "./models/cerebellum.glb",
            scale: 2,
            position: [0, 0, 0],
            facts: [
                {
                    question: "What is the function of the cerebellum?",
                    answer: "The cerebellum coordinates voluntary movements, balance, posture, and motor learning. It helps in precise timing of movements and maintaining equilibrium."
                }
            ]
        },
        {
            id: 6,
            title: "Digestive System",
            description: "Complete 3D visualization of the human digestive system showing all major organs",
            thumbnail: "https://www.thoughtco.com/thmb/aBfklw1eNrdNYyYV_WIG_DK4MhQ=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/digestive_system-5a060e8822fa3a00369da325.jpg",
            modelPath: "https://sketchfab.com/models/daeca5d88af14fa281f5a53b9cc4f4be/embed",
            scale: 2,
            position: [0, 0, 0],
            isSketchfab: true,
            facts: [
                {
                    question: "What are the main organs of the digestive system?",
                    answer: "The main organs include the mouth, esophagus, stomach, small intestine, large intestine, liver, gallbladder, and pancreas. Each plays a crucial role in breaking down food and absorbing nutrients."
                }
            ]
        },
        {
            id: 7,
            title: "Human Lungs",
            description: "Realistic 3D model of human lungs showing bronchial structure",
            thumbnail: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTiXDr64pB9U6P3fZRDIZ-d-ss8xuJEu1i0Fw&s",
            modelPath: "./models/realistic_human_lungs.glb",
            scale: 1.5,
            position: [0, 0, 0],
            facts: [
                {
                    question: "How do lungs work?",
                    answer: "Lungs work by taking in oxygen through inhalation and removing carbon dioxide through exhalation. The bronchial tubes branch into smaller air passages called bronchioles, ending in tiny air sacs called alveoli where gas exchange occurs."
                }
            ]
        },
        {
            id: 8,
            title: "Small and Large Intestine",
            description: "Detailed model showing the structure and function of intestines",
            thumbnail: "https://p.turbosquid.com/ts-thumb/un/0h4pLz/DN/intestine_si/jpg/1666108276/300x300/sharp_fit_q85/ec6cda8181b593cdc742656fc147d90b8391cb4a/intestine_si.jpg",
            modelPath: "https://sketchfab.com/models/2752fd086f584bb38323130db2133078/embed",
            scale: 1.5,
            position: [0, 0, 0],
            isSketchfab: true,
            facts: [
                {
                    question: "What is the difference between small and large intestine?",
                    answer: "The small intestine is primarily responsible for nutrient absorption and is longer but smaller in diameter. The large intestine mainly absorbs water and electrolytes, and forms stool."
                }
            ]
        },
        {
            id: 9,
            title: "Human Skin Structure",
            description: "Detailed cross-section of human skin showing all layers",
            thumbnail: "https://media.sciencephoto.com/c0/20/27/04/c0202704-800px-wm.jpg",
            modelPath: "https://sketchfab.com/models/2c902649de1843e9b2e004a99a9ab923/embed",
            scale: 1.5,
            position: [0, 0, 0],
            isSketchfab: true,
            facts: [
                {
                    question: "What are the layers of human skin?",
                    answer: "The skin has three main layers: epidermis (outer layer), dermis (middle layer), and hypodermis (deepest layer). Each layer serves specific functions in protection, sensation, and temperature regulation."
                }
            ]
        },
        {
            id: 10,
            title: "Kidney Cross Section",
            description: "Anatomical cross-section of human kidney showing internal structures",
            thumbnail: "https://thumbs.dreamstime.com/z/d-rendered-medically-accurate-illustration-kidney-cross-section-kidney-cross-section-115662578.jpg",
            modelPath: "https://sketchfab.com/models/0215aaf9e9a243cdafca249a979680b0/embed",
            scale: 2,
            position: [0, 0, 0],
            isSketchfab: true,
            facts: [
                {
                    question: "How do kidneys filter blood?",
                    answer: "Kidneys filter blood through tiny units called nephrons. Each nephron contains a glomerulus that filters waste and excess water, which then moves through tubules where useful substances are reabsorbed."
                }
            ]
        },
        {
            id: 11,
            title: "Facial Anatomy",
            description: "Comprehensive model of human facial anatomy including muscles, nerves, and blood vessels",
            thumbnail: "https://media.sketchfab.com/models/99717ac9c0434ac59fc5efd3d1dc3471/thumbnails/464edd5981ba4c178d6aed9ff5efc7b1/c235ebb0329045f4ac17d2a551bffd83.jpeg",
            modelPath: "https://sketchfab.com/models/c19e033758f24fef87aa29eeff3191a0/embed",
            scale: 1.5,
            position: [0, 0, 0],
            isSketchfab: true,
            facts: [
                {
                    question: "What are the main facial muscles?",
                    answer: "The main facial muscles include the frontalis (forehead), orbicularis oculi (around eyes), zygomaticus (smile), and masseter (jaw). These muscles control facial expressions and movements."
                }
            ]
        },
        {
            id: 12,
            title: "Brain Stem & Cranial Nerves",
            description: "Detailed visualization of the brain stem and cranial nerve pathways",
            thumbnail: "https://innerbody.imgix.net/nerves_head_neck.png",
            modelPath: "https://sketchfab.com/models/2792c4a8600b4984960c5caf949feb4d/embed",
            scale: 1.5,
            position: [0, 0, 0],
            isSketchfab: true,
            facts: [
                {
                    question: "What are cranial nerves?",
                    answer: "Cranial nerves are 12 pairs of nerves that emerge directly from the brain and brain stem. They control various functions including vision, hearing, smell, facial movements, and internal organ regulation."
                }
            ]
        }
    ],
    chemistry: [
        {
            id: 1,
            title: "Atom",
            description: "Interactive 3D model showcasing atomic structure with electrons, protons, neutrons, and electron orbitals",
            thumbnail: "https://media.istockphoto.com/id/103993818/photo/model-of-a-lithium-atom.jpg?s=612x612&w=0&k=20&c=qTStQZuDqlPqOLGWK2lvTBPUlvBRKnueJYnHzOwKw_M=",
            modelPath: "./models/atom.glb",
            scale: 2,
            position: [0, 0, 0],
            facts: [
                {
                    question: "What are the basic components of an atom?",
                    answer: "An atom consists of a nucleus containing protons (positive charge) and neutrons (neutral), surrounded by electrons (negative charge) orbiting in electron shells."
                },
                {
                    question: "How do electron shells work?",
                    answer: "Electron shells are distinct energy levels where electrons orbit the nucleus. Each shell can hold a specific number of electrons, following the 2n² rule, where n is the shell number."
                }
            ]
        },
        {
            id: 2,
            title: "Chemistry Glassware",
            description: "Comprehensive collection of common laboratory glassware used in chemical experiments and analysis",
            thumbnail: "https://www.laboratorydeal.com/cdn/shop/articles/Scientific_Glassware_-_Laboratory_Glassware_Manufacturer_and_Suppliers.jpg?v=1683956879",
            modelPath: "./models/chemistry_glassware.glb",
            scale: 2,
            position: [0, 0, 0],
            facts: [
                {
                    question: "What are the common types of chemistry glassware?",
                    answer: "Common laboratory glassware includes beakers, Erlenmeyer flasks, test tubes, volumetric flasks, pipettes, and burettes. Each serves specific functions in measuring, mixing, and storing chemicals."
                },
                {
                    question: "Why is borosilicate glass used in laboratory glassware?",
                    answer: "Borosilicate glass is used because it's highly resistant to thermal shock, chemical corrosion, and has a low coefficient of thermal expansion, making it ideal for laboratory use."
                }
            ]
        },
        {
            id: 3,
            title: "3D Periodic Table",
            description: "Interactive periodic table showing all elements with their properties, electron configurations, and common applications",
            thumbnail: "https://img-new.cgtrader.com/items/3564665/fcc524b024/large/the-3d-periodic-table-3d-model-obj-blend.jpg",
            modelPath: "./models/the_3d_periodic_table.glb",
            scale: 2,
            position: [0, 0, 0],
            facts: [
                {
                    question: "How is the periodic table organized?",
                    answer: "The periodic table is organized by atomic number (number of protons), with elements in the same column (group) having similar chemical properties. Rows (periods) represent electron shells, and the table is divided into metals, non-metals, and metalloids."
                },
                {
                    question: "What are the main groups in the periodic table?",
                    answer: "Key groups include alkali metals, alkaline earth metals, transition metals, halogens, and noble gases. Each group has distinct chemical and physical properties based on their electron configurations."
                }
            ]
        },
        {
            id: 4,
            title: "SARS-CoV-2 Virus",
            description: "Detailed 3D model of the coronavirus structure",
            thumbnail: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTrF_CM7KHY8twGTvEHK2gkM80KIoMRiiDhIA&s",
            modelPath: "./models/lowpoly_coronavirus_sars-cov-2.glb",
            scale: 2,
            position: [0, 0, 0],
            facts: [
                {
                    question: "What is the structure of coronavirus?",
                    answer: "The coronavirus has a spherical shape with spike proteins on its surface, giving it a crown-like appearance. Inside is genetic material (RNA) protected by a protein shell."
                },
                {
                    question: "How do the spike proteins work?",
                    answer: "Spike proteins help the virus enter human cells by binding to ACE2 receptors on cell surfaces. They are also the main target for vaccines and antibodies."
                }
            ]
        },
        {
            id: 5,
            title: "Stylized Chemistry Set",
            description: "Beautifully stylized 3D model of a complete chemistry laboratory setup with various equipment and apparatus",
            thumbnail: "https://images.unsplash.com/photo-1730387525836-16ea5e46eb19?q=80&w=3024&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            modelPath: "./models/stylized_chemistry_set.glb",
            scale: 2,
            position: [0, 0, 0],
            facts: [
                {
                    question: "What are the essential components of a chemistry laboratory?",
                    answer: "A chemistry laboratory typically includes equipment like Bunsen burners, beakers, flasks, test tubes, pipettes, and safety equipment like goggles and gloves. Each piece serves specific purposes in conducting experiments safely and accurately."
                },
                {
                    question: "What safety measures are important in a chemistry lab?",
                    answer: "Key safety measures include wearing appropriate protective equipment (goggles, gloves, lab coats), proper ventilation, knowledge of emergency procedures, and careful handling of chemicals. Always follow safety protocols and read chemical labels carefully."
                }
            ]
        },
        {
            id: 6,
            title: "Bunsen Burner",
            description: "Detailed 3D model of a laboratory Bunsen burner showing its components and structure",
            thumbnail: "https://www.shutterstock.com/shutterstock/photos/2271783001/display_1500/stock-vector-bunsen-burner-isolated-on-white-background-a-bunsen-burner-is-a-laboratory-tool-that-produces-a-2271783001.jpg",
            modelPath: "./models/bunsen_burner.glb",
            scale: 2,
            position: [0, 0, 0],
            facts: [
                {
                    question: "What is a Bunsen burner and how does it work?",
                    answer: "A Bunsen burner is a common piece of laboratory equipment that produces a single open gas flame. It works by mixing gas with air in controlled proportions, creating a flame that can be adjusted for different temperatures and characteristics."
                },
                {
                    question: "What are the main parts of a Bunsen burner?",
                    answer: "The main parts include the base, gas inlet, barrel (chimney), air holes, and collar. The collar controls the amount of air entering the burner, which affects the flame's temperature and color."
                },
                {
                    question: "What are the different types of flames a Bunsen burner can produce?",
                    answer: "A Bunsen burner can produce three types of flames: a yellow safety flame (when air holes are closed), a blue heating flame (when air holes are partially open), and a roaring blue flame (when air holes are fully open)."
                }
            ]
        },
        {
            id: 7,
            title: "Apparatus Chemistry",
            description: "Comprehensive collection of laboratory apparatus and equipment used in chemical experiments and analysis",
            thumbnail: "https://static.vecteezy.com/system/resources/previews/054/716/251/non_2x/chemistry-lab-equipment-a-3d-model-of-glassware-and-apparatus-free-png.png",
            modelPath: "https://sketchfab.com/models/d72641e31ada4bdba415d61bbc43f2c8/embed",
            scale: 2,
            position: [0, 0, 0],
            isSketchfab: true,
            facts: [
                {
                    question: "What are the common laboratory apparatus shown in this model?",
                    answer: "This model displays various essential laboratory apparatus including beakers, flasks, test tubes, pipettes, burettes, and other specialized equipment used for measuring, mixing, and analyzing chemicals in a laboratory setting."
                },
                {
                    question: "How are these apparatus used in chemical experiments?",
                    answer: "Each piece of apparatus serves a specific purpose: beakers and flasks are used for mixing and storing solutions, test tubes for small-scale reactions, pipettes and burettes for precise volume measurements, and specialized equipment for specific chemical processes like distillation or titration."
                },
                {
                    question: "What safety considerations are important when using these apparatus?",
                    answer: "When using laboratory apparatus, it's crucial to wear appropriate protective equipment, handle glassware carefully, ensure proper ventilation, and follow specific safety protocols for each piece of equipment. Regular cleaning and proper storage are also essential for maintaining laboratory safety."
                }
            ]
        },
        {
            id: 8,
            title: "Microscope",
            description: "Detailed 3D model of a laboratory microscope showing its components and structure",
            thumbnail: "https://m.media-amazon.com/images/I/61H2UqGBX1L.jpg",
            modelPath: "https://sketchfab.com/models/dcb7993a23cc4878813d011c061fefca/embed",
            scale: 2,
            position: [0, 0, 0],
            isSketchfab: true,
            facts: [
                {
                    question: "What are the main components of a microscope?",
                    answer: "A microscope consists of several key components including the eyepiece, objective lenses, stage, light source, and focus knobs. Each component plays a crucial role in magnifying and viewing specimens."
                },
                {
                    question: "How does a microscope work?",
                    answer: "A microscope works by using a combination of lenses to magnify small objects. Light passes through the specimen, through the objective lens, and then through the eyepiece, creating a magnified image."
                },
                {
                    question: "What are the different types of microscopes?",
                    answer: "Common types include compound light microscopes, stereo microscopes, and electron microscopes. Each type has specific applications and magnification capabilities."
                }
            ]
        }
    ],
    physics: [
        {
            id: 1,
            title: "Earthquake and Tsunami",
            description: "Interactive model demonstrating the mechanics of earthquakes and tsunami formation",
            thumbnail: "https://media.sketchfab.com/models/5325ba12207c4dada68345e52c35ee38/thumbnails/d81d39dabcae46bf94072089466ea9b8/635269bd0c9f469c83b72b874fad142a.jpeg",
            modelPath: "https://sketchfab.com/models/5325ba12207c4dada68345e52c35ee38/embed",
            scale: 2,
            position: [0, 0, 0],
            isSketchfab: true,
            facts: [
                {
                    question: "How do tsunamis form?",
                    answer: "Tsunamis typically form when large volumes of water are displaced by underwater earthquakes, volcanic eruptions, or landslides. The energy transfer creates powerful waves that can travel across entire oceans."
                }
            ]
        },
        {
            id: 2,
            title: "Circular Polarization",
            description: "Interactive 3D visualization of circular polarization in electromagnetic waves",
            thumbnail: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/77/Circular.Polarization.Circularly.Polarized.Light_With.Components_Right.Handed.svg/440px-Circular.Polarization.Circularly.Polarized.Light_With.Components_Right.Handed.svg.png",
            modelPath: "https://sketchfab.com/models/0bf07181c0314a7c891cb6944a37ea97/embed",
            scale: 2,
            position: [0, 0, 0],
            isSketchfab: true,
            facts: [
                {
                    question: "What is circular polarization?",
                    answer: "Circular polarization is a type of electromagnetic wave polarization where the electric field vector rotates in a circular pattern as the wave propagates. This creates a helical pattern in the wave's electric field."
                },
                {
                    question: "How does circular polarization differ from linear polarization?",
                    answer: "In linear polarization, the electric field oscillates in a single plane. In circular polarization, the electric field rotates in a circular pattern, creating a more complex wave structure that can be either right-handed or left-handed."
                }
            ]
        },
        {
            id: 3,
            title: "Physics Simulation",
            description: "Interactive 3D model demonstrating physics principles and simulations",
            thumbnail: "https://images.unsplash.com/photo-1642922517735-d4482d64212d?q=80&w=3132&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            modelPath: "./models/simulated.glb",
            scale: 2,
            position: [0, 0, 0],
            facts: [
                {
                    question: "What does this physics simulation demonstrate?",
                    answer: "This simulation demonstrates various physics principles and phenomena in an interactive 3D environment, allowing students to visualize and understand complex physical concepts."
                },
                {
                    question: "How can this model help in learning physics?",
                    answer: "The interactive 3D model provides a hands-on learning experience, allowing students to explore physics concepts from different angles and perspectives, making complex principles more accessible and engaging."
                }
            ]
        },
        {
            id: 4,
            title: "Slime Physics",
            description: "Interactive 3D model demonstrating slime physics and obstacle interactions",
            thumbnail: "https://images.unsplash.com/photo-1645323927916-969f9f314ba3?q=80&w=2929&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            modelPath: "./models/slime_3_with_obstacles.glb",
            scale: 2,
            position: [0, 0, 0],
            facts: [
                {
                    question: "What does this slime physics simulation demonstrate?",
                    answer: "This simulation demonstrates the physical properties and behavior of slime-like materials, including deformation, elasticity, and interaction with obstacles. It helps visualize how soft materials respond to forces and constraints."
                },
                {
                    question: "How does the slime interact with obstacles?",
                    answer: "The slime model shows how a deformable material adapts its shape when encountering obstacles, demonstrating principles of fluid dynamics, elasticity, and material deformation in a visually engaging way."
                }
            ]
        },
        {
            id: 5,
            title: "Physics Simulation",
            description: "Interactive 3D model demonstrating physics principles and simulations",
            thumbnail: "https://images.unsplash.com/photo-1642922517735-d4482d64212d?q=80&w=3132&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            modelPath: "./models/simulated.glb",
            scale: 2,
            position: [0, 0, 0],
            facts: [
                {
                    question: "What does this physics simulation demonstrate?",
                    answer: "This simulation demonstrates various physics principles and phenomena in an interactive 3D environment, allowing students to visualize and understand complex physical concepts."
                },
                {
                    question: "How can this model help in learning physics?",
                    answer: "The interactive 3D model provides a hands-on learning experience, allowing students to explore physics concepts from different angles and perspectives, making complex principles more accessible and engaging."
                }
            ]
        },
        {
            id: 6,
            title: "Eddy Current",
            description: "Interactive 3D visualization of eddy currents and their effects in electromagnetic systems",
            thumbnail: "https://pub.mdpi-res.com/sensors/sensors-22-08695/article_deploy/html/images/sensors-22-08695-g001.png?1668733788",
            modelPath: "https://sketchfab.com/models/c5f8170bdb6c445994cfc387e9a4a6f8/embed",
            scale: 2,
            position: [0, 0, 0],
            isSketchfab: true,
            facts: [
                {
                    question: "What are eddy currents?",
                    answer: "Eddy currents are circular electric currents induced within conductors by a changing magnetic field. They flow in closed loops perpendicular to the magnetic field direction."
                },
                {
                    question: "How do eddy currents affect electromagnetic systems?",
                    answer: "Eddy currents can cause energy losses in transformers and electric motors through Joule heating. They also create magnetic fields that oppose the original magnetic field change, a phenomenon known as Lenz's law."
                },
                {
                    question: "What are the practical applications of eddy currents?",
                    answer: "Eddy currents are used in metal detectors, electromagnetic braking systems, and non-destructive testing. They can also be harnessed for induction heating and magnetic levitation."
                }
            ]
        },
        {
            id: 7,
            title: "Pendulum Animation",
            description: "Interactive 3D model demonstrating the motion and physics of a pendulum",
            thumbnail: "https://www.physicsclassroom.com/Class/waves/u10l0c5.gif",
            modelPath: "https://sketchfab.com/models/2623516f67d8422596b58377cc70a456/embed",
            scale: 2,
            position: [0, 0, 0],
            isSketchfab: true,
            facts: [
                {
                    question: "What is a pendulum?",
                    answer: "A pendulum is a weight suspended from a fixed point that swings back and forth under the influence of gravity. It's a classic example of periodic motion and demonstrates several fundamental physics principles."
                },
                {
                    question: "What physics principles does a pendulum demonstrate?",
                    answer: "A pendulum demonstrates several key physics principles including simple harmonic motion, conservation of energy, and the relationship between period and length (T = 2π√(L/g)). The motion is driven by gravity and follows a predictable pattern."
                },
                {
                    question: "What factors affect a pendulum's period?",
                    answer: "The period of a pendulum is affected by its length (longer pendulums have longer periods), the acceleration due to gravity, and to a small extent, the amplitude of the swing. The mass of the bob doesn't affect the period in an ideal pendulum."
                }
            ]
        },
        {
            id: 8,
            title: "Newton's Cradle",
            description: "Interactive 3D model demonstrating the conservation of momentum and energy through the classic Newton's Cradle experiment",
            thumbnail: "https://images.unsplash.com/photo-1633493702341-4d04841df53b?q=80&w=2960&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            modelPath: "https://sketchfab.com/models/642434fb6a6a45c5b74b587fec80f534/embed",
            scale: 2,
            position: [0, 0, 0],
            isSketchfab: true,
            facts: [
                {
                    question: "What is Newton's Cradle?",
                    answer: "Newton's Cradle is a device that demonstrates the conservation of momentum and energy through a series of swinging spheres. When one sphere is released, it transfers its energy through the series of spheres, causing the last one to swing out."
                },
                {
                    question: "What physics principles does Newton's Cradle demonstrate?",
                    answer: "Newton's Cradle demonstrates several key physics principles including conservation of momentum, conservation of energy, elastic collisions, and the transfer of kinetic energy through a system."
                },
                {
                    question: "Why do the spheres eventually stop moving?",
                    answer: "The spheres eventually stop due to energy losses from air resistance, friction at the pivot points, and sound energy. This demonstrates that while momentum and energy are conserved in ideal conditions, real-world systems always have some energy dissipation."
                }
            ]
        }
    ]
};

// Loading state component
function LoadingState({ color = "#5C5FFF" }) {
    return (
        <group>
            <Float speed={1.5} rotationIntensity={1} floatIntensity={2}>
                <mesh>
                    <sphereGeometry args={[0.5, 32, 32]} />
                    <meshStandardMaterial color={color} wireframe />
                </mesh>
                <Text
                    position={[0, -1, 0]}
                    fontSize={0.2}
                    color={color}
                    anchorX="center"
                    anchorY="middle"
                >
                    Loading...
                </Text>
            </Float>
        </group>
    );
}

// Error state component
function ErrorState({ title }: { title: string }) {
    return (
        <group>
            <Float speed={1} rotationIntensity={0.5} floatIntensity={1}>
                <Text
                    position={[0, 0.5, 0]}
                    fontSize={0.3}
                    color="#FF647C"
                    anchorX="center"
                    anchorY="middle"
                >
                    {title}
                </Text>
                <Text
                    position={[0, -0.5, 0]}
                    fontSize={0.2}
                    color="#FF647C"
                    anchorX="center"
                    anchorY="middle"
                >
                    Error Loading Model
                </Text>
            </Float>
        </group>
    );
}

// Enhanced PlaceholderModel component with 3D elements
function PlaceholderModel({ title }: { title: string }) {
    return (
        <group>
            <Float speed={1.5} rotationIntensity={1} floatIntensity={2}>
                <mesh>
                    <sphereGeometry args={[0.5, 32, 32]} />
                    <meshStandardMaterial color="#5C5FFF" wireframe />
                </mesh>
                <Text
                    position={[0, -1, 0]}
                    fontSize={0.2}
                    color="#5C5FFF"
                    anchorX="center"
                    anchorY="middle"
                >
                    {title}
                </Text>
                <Text
                    position={[0, -1.3, 0]}
                    fontSize={0.15}
                    color="#3E3E46"
                    anchorX="center"
                    anchorY="middle"
                >
                    Loading interactive 3D model...
                </Text>
            </Float>
        </group>
    );
}

// Update Model component with better error handling and loading states
function Model({ modelPath, scale = 1, position = [0, 0, 0], rotation = [0, 0, 0], title }: {
    modelPath: string;
    scale?: number;
    position?: [number, number, number];
    rotation?: [number, number, number];
    title: string;
}) {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [modelNotFound, setModelNotFound] = useState(false);
    const { scene, animations } = useGLTF(modelPath);
    const mixer = useRef<THREE.AnimationMixer | null>(null);
    const modelRef = useRef<THREE.Group | null>(null);

    useEffect(() => {
        if (scene) {
            try {
                setLoading(false);
                setError(false);
                setModelNotFound(false);

                // Better model positioning and scaling
                scene.position.set(0, 0, 0);
                const box = new THREE.Box3().setFromObject(scene);
                const center = box.getCenter(new THREE.Vector3());
                const size = box.getSize(new THREE.Vector3());

                // Adjust scale based on model size
                const maxDim = Math.max(size.x, size.y, size.z);
                const targetSize = 2; // Desired size in units
                const autoScale = targetSize / maxDim;
                scene.scale.multiplyScalar(autoScale * scale);

                // Center the model
                scene.position.sub(center.multiplyScalar(autoScale * scale));
                scene.position.y += 0.2; // Slight vertical offset

                // Enhanced materials
                scene.traverse((child) => {
                    if (child instanceof THREE.Mesh) {
                        child.castShadow = true;
                        child.receiveShadow = true;

                        if (child.material) {
                            // Enhance material properties
                            if (Array.isArray(child.material)) {
                                child.material.forEach(mat => {
                                    mat.roughness = 0.6;
                                    mat.metalness = 0.2;
                                    mat.envMapIntensity = 1;
                                    mat.needsUpdate = true;
                                });
                            } else {
                                child.material.roughness = 0.6;
                                child.material.metalness = 0.2;
                                child.material.envMapIntensity = 1;
                                child.material.needsUpdate = true;
                            }
                        }
                    }
                });

                // Handle animations
                if (animations && animations.length > 0) {
                    mixer.current = new THREE.AnimationMixer(scene);
                    animations.forEach((clip) => {
                        const action = mixer.current?.clipAction(clip);
                        if (action) {
                            action.play();
                        }
                    });
                }

                // Store reference to the model
                modelRef.current = scene;

            } catch (err) {
                console.error('Error processing model:', err);
                setError(true);
            }
        }
    }, [scene, animations, scale]);

    // Animation loop
    useEffect(() => {
        let animationFrameId: number;

        const animate = () => {
            if (mixer.current) {
                mixer.current.update(0.016); // Assuming 60fps
            }
            animationFrameId = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
            }
            if (mixer.current) {
                mixer.current.stopAllAction();
            }
        };
    }, []);

    if (loading) {
        return <LoadingState />;
    }

    if (modelNotFound) {
        return (
            <group>
                <Float speed={1.5} rotationIntensity={1} floatIntensity={2}>
                    <mesh>
                        <sphereGeometry args={[0.5, 32, 32]} />
                        <meshStandardMaterial color="#FF647C" wireframe />
                    </mesh>
                    <Text
                        position={[0, -1, 0]}
                        fontSize={0.2}
                        color="#FF647C"
                        anchorX="center"
                        anchorY="middle"
                    >
                        Model Not Found
                    </Text>
                    <Text
                        position={[0, -1.3, 0]}
                        fontSize={0.15}
                        color="#3E3E46"
                        anchorX="center"
                        anchorY="middle"
                    >
                        The 3D model file is missing
                    </Text>
                </Float>
            </group>
        );
    }

    if (error || !scene) {
        return <ErrorState title={title} />;
    }

    return (
        <group scale={scale} position={position} rotation={rotation}>
            <primitive object={scene} dispose={null} />
        </group>
    );
}

// Preload the models
useGLTF.preload('./models/cerebellum.glb');

// Update ModelViewer component to handle Sketchfab models with white strips
const ModelViewer = ({ model }: { model: ModelType }) => {
    const [modelAvailable, setModelAvailable] = useState(true);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showControls, setShowControls] = useState(true);
    const [autoRotate, setAutoRotate] = useState(true);
    const [viewMode, setViewMode] = useState<'orbit' | 'first-person'>('orbit');

    useEffect(() => {
        // Check if the model file exists
        if (!model.isSketchfab) {
            fetch(model.modelPath)
                .then(response => {
                    if (!response.ok) {
                        setModelAvailable(false);
                    }
                })
                .catch(() => {
                    setModelAvailable(false);
                });
        }
    }, [model.modelPath, model.isSketchfab]);

    if (!modelAvailable && !model.isSketchfab) {
        return (
            <div className="w-full h-full flex items-center justify-center">
                <div className="w-full h-full">
                    <Canvas>
                        <PlaceholderModel title={model.title} />
                    </Canvas>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full h-full relative rounded-lg overflow-hidden bg-white">
            {/* Background */}
            <div className="absolute inset-0 bg-white z-0" />

            {model.isSketchfab ? (
                <div className="relative w-full h-full z-10">
                    {/* Top white strip */}
                    <div className="absolute top-0 left-0 right-0 h-[50px] bg-white z-20" />

                    {/* Bottom white strip */}
                    <div className="absolute bottom-0 left-0 right-0 h-[50px] bg-white z-20" />

                    {/* Top border line */}
                    <div className="absolute top-[50px] left-0 right-0 h-[1px] bg-[#FAFAFA] z-20" />

                    {/* Bottom border line */}
                    <div className="absolute bottom-[50px] left-0 right-0 h-[1px] bg-[#FAFAFA] z-20" />

                    <iframe
                        title={model.title}
                        className="w-full h-full"
                        frameBorder="0"
                        allowFullScreen
                        allow="autoplay; fullscreen; xr-spatial-tracking"
                        src={model.modelPath}
                    />
                </div>
            ) : (
                <Canvas
                    shadows
                    dpr={[1, 2]}
                    gl={{
                        antialias: true,
                        preserveDrawingBuffer: true,
                        alpha: true,
                        powerPreference: "high-performance"
                    }}
                    className="z-10"
                    camera={{
                        position: viewMode === 'orbit' ? [0, 0, 8] : [0, 2, 5],
                        fov: viewMode === 'orbit' ? 38 : 75
                    }}
                >
                    <color attach="background" args={['#FAFBFF']} />
                    <fog attach="fog" args={['#FAFBFF', 15, 25]} />

                    <Suspense fallback={<PlaceholderModel title={model.title} />}>
                        {/* Enhanced lighting setup */}
                        <ambientLight intensity={0.5} />
                        <directionalLight
                            position={[5, 5, 5]}
                            intensity={0.8}
                            castShadow
                            shadow-mapSize-width={2048}
                            shadow-mapSize-height={2048}
                            shadow-camera-far={50}
                            shadow-camera-left={-10}
                            shadow-camera-right={10}
                            shadow-camera-top={10}
                            shadow-camera-bottom={-10}
                        />
                        <directionalLight position={[-5, 5, 5]} intensity={0.4} />
                        <pointLight position={[0, 10, 0]} intensity={0.5} />

                        <group position={[0, -0.2, 0]}>
                            <ContactShadows
                                opacity={0.7}
                                scale={20}
                                blur={2.5}
                                far={10}
                                resolution={1024}
                                color="#000000"
                            />
                            <Model
                                modelPath={model.modelPath}
                                scale={model.scale ? model.scale * 1.25 : 1.25}
                                position={model.position}
                                rotation={model.rotation}
                                title={model.title}
                            />
                        </group>

                        <Environment preset="city" />

                        {/* Enhanced controls based on view mode */}
                        {viewMode === 'orbit' ? (
                            <OrbitControls
                                autoRotate={autoRotate}
                                autoRotateSpeed={0.5}
                                enableZoom
                                enablePan={false}
                                enableDamping
                                dampingFactor={0.15}
                                minDistance={2}
                                maxDistance={20}
                                minPolarAngle={Math.PI / 4}
                                maxPolarAngle={Math.PI * 3 / 4}
                                target={[0, 0.2, 0]}
                                makeDefault
                            />
                        ) : (
                            <PerspectiveCamera
                                makeDefault
                                position={[0, 2, 5]}
                                fov={75}
                            />
                        )}
                    </Suspense>
                </Canvas>
            )}

            {/* Enhanced controls overlay */}
            <div className={cn(
                "absolute bottom-4 left-1/2 -translate-x-1/2 flex justify-center items-center gap-2 bg-white/95 p-3 rounded-full shadow-lg border border-[#5C5FFF]/10 backdrop-blur-md z-20 transition-all duration-500",
                showControls ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"
            )}>
                <Button
                    className="bg-white hover:bg-[#5C5FFF]/5 border border-[#5C5FFF]/20 text-[#3E3E46] transition-all duration-300 rounded-full"
                    size="sm"
                    onClick={() => setAutoRotate(!autoRotate)}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                        <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.3" />
                    </svg>
                    {autoRotate ? "Stop Rotation" : "Start Rotation"}
                </Button>

                <Button
                    className="bg-white hover:bg-[#5C5FFF]/5 border border-[#5C5FFF]/20 text-[#3E3E46] transition-all duration-300 rounded-full"
                    size="sm"
                    onClick={() => setViewMode(viewMode === 'orbit' ? 'first-person' : 'orbit')}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                        <circle cx="12" cy="12" r="3" />
                        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                    </svg>
                    {viewMode === 'orbit' ? "First Person" : "Orbit"} View
                </Button>

                <Button
                    className="bg-white hover:bg-[#5C5FFF]/5 border border-[#5C5FFF]/20 text-[#3E3E46] transition-all duration-300 rounded-full"
                    size="sm"
                    onClick={() => {
                        const canvas = document.querySelector('canvas');
                        if (canvas) {
                            const link = document.createElement('a');
                            link.download = `${model.title}.png`;
                            link.href = canvas.toDataURL();
                            link.click();
                        }
                    }}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                        <circle cx="12" cy="13" r="4" />
                    </svg>
                    Screenshot
                </Button>
            </div>

            {/* Enhanced toggle controls button */}
            <Button
                className="absolute top-4 right-4 bg-white/95 hover:bg-white text-[#3E3E46] shadow-lg border border-[#5C5FFF]/10 backdrop-blur-md z-20 transition-all duration-300 rounded-full"
                size="sm"
                onClick={() => setShowControls(!showControls)}
            >
                {showControls ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                    </svg>
                )}
                {showControls ? "Hide" : "Show"} Controls
            </Button>
        </div>
    );
};

// Update AIQuestion component with text-to-speech functionality
const AIQuestion = ({ model }: { model: ModelType }) => {
    const [question, setQuestion] = useState("");
    const [loading, setLoading] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [autoSpeak, setAutoSpeak] = useState(true);
    const [language, setLanguage] = useState<'en' | 'hi'>('en');
    const [chatHistory, setChatHistory] = useState<{ role: string, content: string }[]>([]);
    const chatContainerRef = useRef<HTMLDivElement>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    // Voice recognition setup with language support
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            if (SpeechRecognition) {
                const recognition = new SpeechRecognition();
                recognition.continuous = true;
                recognition.interimResults = true;
                recognition.lang = language === 'en' ? 'en-US' : 'hi-IN';

                recognition.onresult = (event) => {
                    const transcript = Array.from(event.results)
                        .map(result => result[0])
                        .map(result => result.transcript)
                        .join('');
                    setQuestion(transcript);
                };

                recognition.onend = () => {
                    setIsListening(false);
                };

                // Store recognition instance
                (window as any).recognition = recognition;
            }
        }
    }, [language]);

    // Toggle voice input
    const toggleVoiceInput = () => {
        if (isListening) {
            (window as any).recognition?.stop();
        } else {
            (window as any).recognition?.start();
            setIsListening(true);
        }
    };

    // Text-to-speech function using ElevenLabs API
    const speakResponse = async (text: string) => {
        try {
            setIsSpeaking(true);
            const response = await fetch('/api/elevenlabs/text-to-speech', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    text,
                    language
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to generate speech');
            }

            const audioBlob = await response.blob();
            const audioUrl = URL.createObjectURL(audioBlob);

            if (audioRef.current) {
                audioRef.current.src = audioUrl;
                await audioRef.current.play();

                // Clean up the audio URL after playback
                audioRef.current.onended = () => {
                    URL.revokeObjectURL(audioUrl);
                    setIsSpeaking(false);
                };
            }
        } catch (error) {
            console.error('Text-to-speech error:', error);
            setIsSpeaking(false);
        }
    };

    // Handle auto-speak for new AI responses
    useEffect(() => {
        const lastMessage = chatHistory[chatHistory.length - 1];
        if (autoSpeak && lastMessage?.role === 'assistant' && lastMessage.content !== '...') {
            speakResponse(lastMessage.content);
        }
    }, [chatHistory, autoSpeak]);

    // Auto-scroll to bottom when chat history updates
    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [chatHistory]);

    // Function to call DeepSeek API with language support
    const callDeepSeekAPI = async (prompt: string) => {
        setLoading(true);

        try {
            // First try to use predefined facts if available and in English mode
            if (language === 'en' && model.facts) {
                const matchedFact = model.facts.find(fact =>
                    fact.question.toLowerCase().includes(prompt.toLowerCase()) ||
                    prompt.toLowerCase().includes(fact.question.toLowerCase())
                );

                if (matchedFact) {
                    return matchedFact.answer;
                }
            }

            // If no predefined fact matches or in Hindi mode, call the API
            const systemPrompt = language === 'en'
                ? `You are an educational AI assistant specializing in explaining 3D models. 
                   You're currently explaining a 3D model of ${model.title}. 
                   Provide detailed, accurate, and educational information about this model.
                   Keep your answers concise but informative, suitable for students.
                   Format your responses using Markdown:
                   - Use headings (##) for main points
                   - Use bullet points or numbered lists for steps or related points
                   - Use **bold** for emphasis on important terms
                   - Use \`code\` for technical terms or measurements
                   - Use > for important notes or quotes
                   - Use proper paragraph breaks for readability`
                : `आप एक शैक्षिक AI सहायक हैं जो 3D मॉडल की व्याख्या में विशेषज्ञ हैं।
                   आप वर्तमान में ${model.title} के 3D मॉडल की व्याख्या कर रहे हैं।
                   इस मॉडल के बारे में विस्तृत, सटीक और शैक्षिक जानकारी प्रदान करें।
                   अपने उत्तर संक्षिप्त लेकिन जानकारीपूर्ण रखें, जो छात्रों के लिए उपयुक्त हों।
                   कृपया हिंदी में जवाब दें।
                   अपने जवाब को Markdown का उपयोग करके फॉर्मेट करें:
                   - मुख्य बिंदुओं के लिए हेडिंग (##) का उपयोग करें
                   - चरणों या संबंधित बिंदुओं के लिए बुलेट पॉइंट या क्रमांकित सूची का उपयोग करें
                   - महत्वपूर्ण शब्दों पर जोर देने के लिए **बोल्ड** का उपयोग करें
                   - तकनीकी शब्दों या मापों के लिए \`कोड\` का उपयोग करें
                   - महत्वपूर्ण नोट्स या उद्धरणों के लिए > का उपयोग करें
                   - पठनीयता के लिए उचित पैराग्राफ ब्रेक का उपयोग करें`;

            const response = await fetch('/api/deepseek', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    systemPrompt,
                    userPrompt: prompt,
                    history: chatHistory.slice(-6),
                    language
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'API request failed');
            }

            const data = await response.json();
            return data.answer;

        } catch (error) {
            console.error("Error calling DeepSeek API:", error);
            return language === 'en'
                ? "I'm sorry, I encountered an error while processing your question. Please try again later."
                : "क्षमा करें, आपके प्रश्न को संसाधित करने में एक त्रुटि हुई। कृपया बाद में पुनः प्रयास करें।";
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!question.trim() || loading) return;

        const userQuestion = question.trim();
        setQuestion("");

        // Add user question to chat history
        const newHistory = [
            ...chatHistory,
            { role: "user", content: userQuestion }
        ];
        setChatHistory(newHistory);

        try {
            // Show AI is typing indicator
            setChatHistory([
                ...newHistory,
                { role: "assistant", content: "..." }
            ]);

            const aiResponse = await callDeepSeekAPI(userQuestion);

            // Replace typing indicator with actual response
            setChatHistory([
                ...newHistory,
                { role: "assistant", content: aiResponse }
            ]);
        } catch (error) {
            console.error("Error getting response:", error);
            // Replace typing indicator with error message
            setChatHistory([
                ...newHistory,
                { role: "assistant", content: "I'm sorry, I encountered an error. Please try again." }
            ]);
        }
    };

    // Function to handle suggested question click
    const handleSuggestedQuestion = (question: string) => {
        setQuestion(question);
        // Automatically submit the form after selecting a question
        setTimeout(() => {
            const form = document.getElementById('chat-form') as HTMLFormElement;
            if (form) form.dispatchEvent(new Event('submit', { cancelable: true }));
        }, 100);
    };

    return (
        <div className="space-y-4 h-full flex flex-col">
            {/* Hidden audio element for text-to-speech */}
            <audio ref={audioRef} className="hidden" />

            {/* Chatbot Header with Language and Auto-Speak Toggle */}
            <div className="flex items-center justify-between p-3 bg-gradient-to-r from-[#5C5FFF]/10 to-transparent rounded-lg">
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-[#5C5FFF] flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
                        </svg>
                    </div>
                    <div>
                        <h3 className="text-sm font-medium text-[#3E3E46]">Arise AI</h3>
                        <p className="text-xs text-[#3E3E46]/70">Your Educational Assistant</p>
                    </div>
                </div>
                <div className="flex items-center space-x-2">
                    {/* Language Toggle */}
                    <Button
                        onClick={() => setLanguage(lang => lang === 'en' ? 'hi' : 'en')}
                        variant="ghost"
                        size="sm"
                        className={`p-2 h-auto rounded-full transition-all duration-300 ${language === 'hi' ? 'bg-[#5C5FFF]/10 text-[#5C5FFF]' : 'bg-transparent text-[#3E3E46]/50'
                            }`}
                    >
                        <span className="text-sm font-medium">{language === 'en' ? 'EN' : 'हि'}</span>
                    </Button>

                    {/* Auto-speak Toggle */}
                    <Button
                        onClick={() => setAutoSpeak(!autoSpeak)}
                        variant="ghost"
                        size="sm"
                        className={`p-2 h-auto rounded-full transition-all duration-300 ${autoSpeak ? 'bg-[#5C5FFF]/10 text-[#5C5FFF]' : 'bg-transparent text-[#3E3E46]/50'
                            }`}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                            <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                            <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
                        </svg>
                    </Button>
                </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-grow overflow-auto pr-1 scrollbar-thin" ref={chatContainerRef}>
                {chatHistory.length > 0 ? (
                    <div className="space-y-3 mb-3">
                        {chatHistory.map((message, index) => (
                            <div
                                key={index}
                                className={`p-3 rounded-lg ${message.role === "user"
                                    ? "bg-[#5C5FFF]/10 ml-6 rounded-tr-none"
                                    : "bg-gradient-to-r from-[#5C5FFF] to-[#4a4dcc] text-white mr-6 rounded-tl-none"
                                    }`}
                            >
                                <div className="flex items-center justify-between mb-1">
                                    <div className="flex items-center space-x-2">
                                        {message.role === "user" ? (
                                            <>
                                                <div className="w-6 h-6 rounded-full bg-[#5C5FFF]/20 flex items-center justify-center">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                                        <circle cx="12" cy="7" r="4"></circle>
                                                    </svg>
                                                </div>
                                                <span className="text-xs font-medium text-[#3E3E46]">You</span>
                                            </>
                                        ) : (
                                            <>
                                                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
                                                    </svg>
                                                </div>
                                                <span className="text-xs font-medium text-white">Arise AI</span>
                                            </>
                                        )}
                                    </div>
                                    {message.role === "assistant" && message.content !== "..." && (
                                        <Button
                                            onClick={() => speakResponse(message.content)}
                                            disabled={isSpeaking}
                                            className={`p-1.5 h-auto rounded-full transition-all duration-300 ${isSpeaking
                                                ? "bg-white/30 text-white"
                                                : "bg-white/20 hover:bg-white/30 text-white"
                                                }`}
                                            size="sm"
                                        >
                                            {isSpeaking ? (
                                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <rect x="4" y="2" width="4" height="20" rx="1">
                                                        <animate attributeName="height" values="20;4;20" dur="1.5s" repeatCount="indefinite" />
                                                    </rect>
                                                    <rect x="10" y="2" width="4" height="20" rx="1">
                                                        <animate attributeName="height" values="4;20;4" dur="1.5s" repeatCount="indefinite" />
                                                    </rect>
                                                    <rect x="16" y="2" width="4" height="20" rx="1">
                                                        <animate attributeName="height" values="20;4;20" dur="1.5s" repeatCount="indefinite" />
                                                    </rect>
                                                </svg>
                                            ) : (
                                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                                                    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                                                    <line x1="12" y1="19" x2="12" y2="23" />
                                                    <line x1="8" y1="23" x2="16" y2="23" />
                                                </svg>
                                            )}
                                        </Button>
                                    )}
                                </div>
                                <p className={`text-sm ${message.role === "user" ? "text-[#3E3E46]" : "text-white"} break-words`}>
                                    {message.content === "..." ? (
                                        <span className="flex items-center space-x-1">
                                            <span className="w-1.5 h-1.5 bg-current rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                            <span className="w-1.5 h-1.5 bg-current rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                            <span className="w-1.5 h-1.5 bg-current rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                                        </span>
                                    ) : message.role === "assistant" ? (
                                        <div className="prose prose-sm dark:prose-invert max-w-none prose-p:text-white prose-headings:text-white prose-strong:text-white prose-code:text-white/90 prose-code:bg-white/10 prose-code:rounded prose-code:px-1 prose-a:text-white prose-a:underline">
                                            <ReactMarkdown 
                                                remarkPlugins={[remarkGfm]}
                                                components={{
                                                    p: ({ children }) => <p className="text-sm leading-relaxed mb-2 text-white">{children}</p>,
                                                    h1: ({ children }) => <h1 className="text-xl font-bold mb-2 text-white">{children}</h1>,
                                                    h2: ({ children }) => <h2 className="text-lg font-semibold mb-2 text-white">{children}</h2>,
                                                    h3: ({ children }) => <h3 className="text-base font-medium mb-2 text-white">{children}</h3>,
                                                    ul: ({ children }) => <ul className="list-disc list-inside mb-2">{children}</ul>,
                                                    ol: ({ children }) => <ol className="list-decimal list-inside mb-2">{children}</ol>,
                                                    li: ({ children }) => <li className="text-sm mb-1">{children}</li>,
                                                    code: ({ children }) => (
                                                        <code className="bg-white/10 px-1 py-0.5 rounded text-sm font-mono">
                                                            {children}
                                                        </code>
                                                    ),
                                                    pre: ({ children }) => (
                                                        <pre className="bg-white/10 p-2 rounded-lg overflow-x-auto mb-2">
                                                            {children}
                                                        </pre>
                                                    ),
                                                    blockquote: ({ children }) => (
                                                        <blockquote className="border-l-2 border-white/30 pl-4 italic my-2">
                                                            {children}
                                                        </blockquote>
                                                    ),
                                                    a: ({ children, href }) => (
                                                        <a 
                                                            href={href} 
                                                            target="_blank" 
                                                            rel="noopener noreferrer"
                                                            className="text-white underline hover:text-white/90"
                                                        >
                                                            {children}
                                                        </a>
                                                    ),
                                                }}
                                            >
                                                {message.content}
                                            </ReactMarkdown>
                                        </div>
                                    ) : (
                                        message.content
                                    )}
                                </p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-6">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#5C5FFF]/10 flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#5C5FFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
                                <path d="M12 8v4M12 16h.01" />
                            </svg>
                        </div>
                        <p className="text-[#3E3E46]/70 text-sm mb-4">
                            {language === 'en'
                                ? `Ask Arise AI about the ${model.title} model`
                                : `${model.title} मॉडल के बारे में Arise AI से पूछें`}
                        </p>
                        {model.facts && language === 'en' && (
                            <div className="space-y-2 mt-4">
                                {model.facts.map((fact, index) => (
                                    <SuggestedQuestion
                                        key={index}
                                        question={fact.question}
                                        onClick={() => handleSuggestedQuestion(fact.question)}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Input Form */}
            <form id="chat-form" onSubmit={handleSubmit} className="mt-auto">
                <div className="relative">
                    <Textarea
                        id="question"
                        placeholder={language === 'en'
                            ? "Ask Arise AI about this model..."
                            : "इस मॉडल के बारे में Arise AI से पूछें..."}
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSubmit(e);
                            }
                        }}
                        className="pr-24 resize-none focus:border-[#5C5FFF] focus:ring-[#5C5FFF] min-h-[70px] max-h-[120px] rounded-xl"
                    />
                    <div className="absolute bottom-2 right-2 flex items-center space-x-2">
                        <Button
                            type="button"
                            onClick={toggleVoiceInput}
                            className={`p-2 h-auto aspect-square rounded-full transition-all duration-300 ${isListening
                                ? "bg-red-500 hover:bg-red-600 animate-pulse"
                                : "bg-[#5C5FFF]/10 hover:bg-[#5C5FFF]/20 text-[#5C5FFF]"
                                }`}
                            size="sm"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                                <line x1="12" y1="19" x2="12" y2="23" />
                                <line x1="8" y1="23" x2="16" y2="23" />
                            </svg>
                        </Button>
                        <Button
                            type="submit"
                            disabled={!question.trim() || loading}
                            className="bg-[#5C5FFF] hover:bg-[#4a4dcc] text-white p-2 h-auto aspect-square rounded-full shadow-[0_5px_15px_0px_rgba(92,95,255,0.25)]"
                            size="sm"
                        >
                            {loading ? (
                                <span className="h-4 w-4 block border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
                                </svg>
                            )}
                        </Button>
                    </div>
                </div>
            </form>
        </div>
    );
};

// Update card display for models grid
const ModelCard = ({ model, onClick }: { model: ModelType; onClick: () => void }) => (
    <Card
        className="cursor-pointer group relative overflow-hidden bg-white border-0 shadow-sm hover:shadow-xl transition-all duration-500 ease-out"
        onClick={onClick}
    >
        <div className="aspect-[4/3] relative overflow-hidden">
            {/* Thumbnail Image with error handling */}
            <img
                src={model.thumbnail}
                alt={model.title}
                className="absolute inset-0 w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 ease-out"
                onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "https://via.placeholder.com/400x300?text=No+Image+Available";
                }}
                loading="lazy"
            />
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </div>

        <CardHeader className="relative z-10">
            <CardTitle className="text-lg font-semibold text-[#3E3E46] group-hover:text-[#5C5FFF] transition-colors duration-300">
                {model.title}
            </CardTitle>
            <CardDescription className="text-sm text-[#3E3E46]/70 line-clamp-2">
                {model.description}
            </CardDescription>
        </CardHeader>

        <CardFooter className="border-t pt-3 pb-3">
            <Button
                className="w-full bg-white text-[#5C5FFF] border border-[#5C5FFF]/20 hover:bg-[#5C5FFF] hover:text-white transition-all duration-300 shadow-none hover:shadow-[0_5px_15px_0px_rgba(92,95,255,0.25)]"
                size="sm"
            >
                <span className="mr-2">Explore Model</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
            </Button>
        </CardFooter>
    </Card>
);

// Update the suggested questions UI in AIQuestion component
const SuggestedQuestion = ({ question, onClick }: { question: string; onClick: () => void }) => (
    <button
        onClick={onClick}
        className="w-full text-left p-3 rounded-lg bg-white hover:bg-[#5C5FFF]/5 border border-[#5C5FFF]/20 hover:border-[#5C5FFF] transition-all duration-300 group"
    >
        <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-[#5C5FFF]/10 flex items-center justify-center group-hover:bg-[#5C5FFF]/20 transition-colors duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#5C5FFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 16v-4M12 8h.01" />
                </svg>
            </div>
            <span className="text-sm text-[#3E3E46] group-hover:text-[#5C5FFF] transition-colors duration-300">
                {question}
            </span>
        </div>
    </button>
);

const ARLearningPage = () => {
    const [selectedCategory, setSelectedCategory] = useState<CategoryKey>("biology");
    const [selectedModel, setSelectedModel] = useState<ModelType | null>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    return (
        <div className="relative min-h-screen overflow-hidden bg-[#FAFBFF]">
            {/* Enhanced background grid */}
            <div
                className="absolute inset-0 z-0"
                style={{
                    backgroundImage: `
                        linear-gradient(to right, rgba(92, 95, 255, 0.05) 1px, transparent 1px),
                        linear-gradient(to bottom, rgba(92, 95, 255, 0.05) 1px, transparent 1px)
                    `,
                    backgroundSize: '24px 24px'
                }}
            />
            <div
                className="absolute inset-0 z-0"
                style={{
                    backgroundImage: `
                        radial-gradient(circle at 100px 100px, rgba(92, 95, 255, 0.03) 0%, transparent 60%),
                        radial-gradient(circle at 90% 20%, rgba(255, 100, 124, 0.03) 0%, transparent 50%),
                        radial-gradient(circle at 10% 80%, rgba(0, 194, 209, 0.03) 0%, transparent 50%)
                    `
                }}
            />

            <div className="relative z-10 p-6 overflow-auto">
                {/* Page Header with Animation */}
                <div className="mb-8">
                    <h1
                        className={cn(
                            "text-4xl font-bold tracking-tight text-[#3E3E46] transition-all duration-700",
                            mounted ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
                        )}
                    >
                        <span className="text-[#5C5FFF]">AR</span> Learning Hub
                    </h1>
                    <p
                        className={cn(
                            "text-[#3E3E46]/70 mt-2 text-lg transition-all duration-700 delay-100",
                            mounted ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
                        )}
                    >
                        Explore interactive 3D models across various academic disciplines
                    </p>
                </div>

                {/* Category Tabs with enhanced styling */}
                <div className={cn(
                    "mb-8 transition-all duration-700 delay-200",
                    mounted ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
                )}>
                    <Tabs defaultValue="biology" onValueChange={(value: string) => setSelectedCategory(value as CategoryKey)}>
                        <TabsList className="grid w-full grid-cols-3 mb-6 p-1.5 bg-white/50 backdrop-blur-sm border border-white/50 rounded-xl shadow-[0_8px_16px_0px_rgba(92,95,255,0.06)]">
                            <TabsTrigger
                                value="biology"
                                className={cn(
                                    "transition-all duration-500 rounded-lg",
                                    selectedCategory === "biology" ?
                                        "bg-[#5C5FFF] text-white shadow-[0_8px_16px_0px_rgba(92,95,255,0.25)]" :
                                        "text-[#3E3E46] hover:bg-white/80 data-[state=active]:bg-white"
                                )}
                            >
                                🧬 Biology
                            </TabsTrigger>
                            <TabsTrigger
                                value="chemistry"
                                className={cn(
                                    "transition-all duration-500 rounded-lg",
                                    selectedCategory === "chemistry" ?
                                        "bg-[#FF647C] text-white shadow-[0_8px_16px_0px_rgba(255,100,124,0.25)]" :
                                        "text-[#3E3E46] hover:bg-white/80 data-[state=active]:bg-white"
                                )}
                            >
                                ⚗️ Chemistry
                            </TabsTrigger>
                            <TabsTrigger
                                value="physics"
                                className={cn(
                                    "transition-all duration-500 rounded-lg",
                                    selectedCategory === "physics" ?
                                        "bg-[#00C2D1] text-white shadow-[0_8px_16px_0px_rgba(0,194,209,0.25)]" :
                                        "text-[#3E3E46] hover:bg-white/80 data-[state=active]:bg-white"
                                )}
                            >
                                ⚡ Physics
                            </TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>

                {!selectedModel ? (
                    <div className={cn(
                        "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 transition-all duration-700 delay-300",
                        mounted ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
                    )}>
                        {models[selectedCategory].map((model, index) => (
                            <ModelCard
                                key={model.id}
                                model={model}
                                onClick={() => setSelectedModel(model)}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="h-full flex flex-col">
                        <div className={cn(
                            "mb-4 flex items-center justify-between transition-all duration-700",
                            mounted ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
                        )}>
                            <Button
                                variant="outline"
                                onClick={() => setSelectedModel(null)}
                                className="border-[#5C5FFF]/20 text-[#5C5FFF] hover:bg-[#5C5FFF]/5 transition-all duration-300"
                            >
                                ← Back to models
                            </Button>
                            <h2 className="text-xl font-semibold text-[#3E3E46]">
                                {selectedModel.title}
                            </h2>
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                            <Card className={cn(
                                "col-span-3 bg-white border border-[#FAFAFA] overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 transform",
                                "transition-all duration-700 delay-100",
                                mounted ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
                            )}>
                                <CardHeader className="border-b bg-[#FAFAFA] py-3">
                                    <CardTitle className="text-[#3E3E46]">{selectedModel.title}</CardTitle>
                                    <CardDescription className="text-[#3E3E46]/70">{selectedModel.description}</CardDescription>
                                </CardHeader>
                                <CardContent className="h-[600px] p-0">
                                    <ModelViewer model={selectedModel} />
                                </CardContent>
                            </Card>
                            <Card className={cn(
                                "lg:h-[calc(600px+50px+1px)] flex flex-col bg-white border border-[#FAFAFA] shadow-sm hover:shadow-md transition-all duration-300",
                                "transition-all duration-700 delay-200",
                                mounted ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
                            )}>
                                <CardHeader className="border-b bg-[#FAFAFA] py-3">
                                    <CardTitle className="text-[#3E3E46] text-lg">AI Explanation</CardTitle>
                                </CardHeader>
                                <CardContent className="pt-3 pb-0 px-3 flex-grow overflow-hidden">
                                    <AIQuestion model={selectedModel} />
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ARLearningPage;

// Add this to your global styles
const styles = `
@keyframes gradient-shift {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
}

.animate-gradient-shift {
    animation: gradient-shift 8s ease infinite;
    background-size: 200% 200%;
}
`;
