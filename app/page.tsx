"use client"

import { useState, useMemo, useEffect } from "react"
import {
  Search,
  ExternalLink,
  Calendar,
  Users,
  BookOpen,
  Clock,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Filter,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { loadBibTeXFiles } from "@/lib/bibtex-parser"

interface ParsedPaper {
  id: string;
  title: string;
  authors: string[];
  journal: string;
  year: number;
  volume?: string;
  number?: string;
  pages?: string;
  doi?: string;
  url?: string;
  type: 'article' | 'conference';
  keywords: string[];
  publisher?: string;
  booktitle?: string;
  month?: string;
  isFondecyt?: boolean;
}

// Collaborators data
const principalInvestigator = {
  id: 0,
  name: "Rodrigo Olivares",
  role: "Principal Investigator",
  image: "/rodrigo_olivares.jpeg",
  imagePosition: "object-top",
  bio: "I received my degree in Applied Computer Engineering in 2009, my Master's degree in Computer Engineering in 2015, and my Master's degree in Computer Science Engineering in 2016. I subsequently obtained my PhD in Computer Engineering in 2019.\n\nI currently serve as an Adjunct Professor at the School of Computer Engineering of the Universidad de Valparaíso and hold the position of Head of the Computer Engineering program. My research track record includes collaboration on more than 80 scientific articles, published in prestigious international conferences and mainstream journals.\n\nMy research interests are primarily focused on the study of reactive and self-adaptive metaheuristics, swarm intelligence methods, global optimization, and the use of machine learning in support of bio-solvers.",
  expertise: ["Biomimetic Algorithms", "Optimization", "Machine Learning", "Cybersecurity"],
  publications: 50,
  hIndex: 15,
}

const collaboratorGroups = [
  {
    category: "Collaborators",
    members: [
      {
        id: 1,
        name: "Broderick Crawford",
        role: "Collaborator",
        image: "/broderick_crawford.png",
        imagePosition: "object-top",
        bio: "Full Professor at the School of Computer Engineering. I currently serve as Vice Dean of the Faculty of Engineering at the Pontificia Universidad Católica de Valparaíso, Chile.\n\nMy academic career began at the Universidad Técnica Federico Santa María, where I received my Bachelor's degree in Engineering Sciences in 1988 and my degree in Civil Computer Engineering in 1991. I subsequently obtained an MBA from the Universidad de Chile in 2001 and a PhD in Computer Engineering from UTFSM in 2011.\n\nMy research interests focus on artificial intelligence and optimization, covering areas such as combinatorial optimization, metaheuristics, autonomous search, and binarization of continuous algorithms. In this context, I have collaborated on more than 300 scientific articles published in various international conferences and mainstream journals in computer science, operations research, and artificial intelligence. Most of my scientific output focuses on developing robust solutions for optimization problems, both in benchmark settings and complex real-world applications.",
        expertise: ["Computational Intelligence", "Software Engineering", "Evolutionary Algorithms", "AI Applications"],
        publications: 120,
        hIndex: 22,
      },
      {
        id: 2,
        name: "Roberto Muñoz",
        role: "Collaborator",
        image: "/roberto_munoz.png",
        imagePosition: "object-top",
        bio: "Full Professor and currently serving as Director of the School of Computer Engineering at the Universidad de Valparaíso, Chile.\n\nMy academic training began at the same institution, where I received my degree in Applied Computer Engineering in 2009. I subsequently obtained a Master's in Computer Engineering (2012) and a Master's in Computer Science Engineering (2016), both from the Pontificia Universidad Católica de Valparaíso. I also hold a Master's in Teaching for Higher Education from Universidad Andrés Bello (2015) and earned my PhD in Computer Engineering from PUCV in 2018.\n\nMy research interests are primarily focused on educational informatics and human-computer interaction, including Multimodal Learning Analytics, learning analytics, and computing applied to health and autism spectrum disorders. In this area, I have contributed to more than 100 scientific publications and collaborated on various innovation and technology transfer projects, always seeking to develop computing solutions that generate a positive impact on society and education.",
        expertise: ["Computational Intelligence", "Evolutionary Computation", "Hybrid Optimization", "Complex Systems"],
        publications: 85,
        hIndex: 18,
      },
      {
        id: 3,
        name: "Fabian Riquelme",
        role: "Collaborator",
        image: "/fabian_riquelme.png",
        imagePosition: "object-top",
        bio: "Professor in the Department of Computer Science at the Universitat Politècnica de Catalunya in Barcelona, Spain, with a prior academic career at the School of Computer Engineering at the Universidad de Valparaíso, Chile.\n\nMy academic background includes a degree in Civil Computer Engineering and a Master's in Computer Science from the Universidad de Concepción (Chile), both obtained with highest distinction. I subsequently earned a PhD in Computing from UPC with the outstanding cum laude distinction, through my research on structural and computational aspects of influence games.\n\nAs a researcher, I specialize in Cooperative Game Theory, Social Network Analysis, and Social Computing. My current work at the Polytechnic of Catalonia focuses on developing mathematical models and advanced algorithms to understand influence spreading and decision-making processes in complex environments. I have a strong international collaboration network and have led several competitive research projects aimed at connecting game theory with real-world applications in data science and social networks.",
        expertise: ["Social Network Analysis", "Multi-objective Optimization", "Influence Maximization", "Swarm Intelligence"],
        publications: 25,
        hIndex: 12,
      },
      {
        id: 4,
        name: "Ricardo Soto",
        role: "Collaborator",
        image: "/ricardo_soto.png",
        imagePosition: "object-top",
        bio: "Full Professor of Computer Engineering and currently Director of the School of Computer Engineering at the Pontificia Universidad Católica de Valparaíso. In 2003, I received my degree in Civil Computer Engineering from the same school, and in 2009, I completed my PhD in Computer Science at the University of Nantes, France.\n\nMy research interests include Metaheuristics, Autonomous Search, Machine Learning, and Constraint Programming. In this context, I have published more than 300 scientific articles in various international conferences and journals, several of which have been highlighted in topics such as Computer Science, Operations Research, Artificial Intelligence, and Programming Languages. I have also participated as leader and co-leader in a significant number of national and international projects in Computer Science and Artificial Intelligence.\n\nMy teaching experience includes courses such as Operations Research, Combinatorial Optimization, Constraint Programming, Metaheuristics, Data Structures, Logic Programming, Automata Theory, and Compiler Design. I have also supervised more than 80 Engineering, Master's, and PhD students, the vast majority of whom have participated in my research projects.",
        expertise: ["Constraint Programming", "Metaheuristics", "Artificial Intelligence", "Operations Research"],
        publications: 150,
        hIndex: 25,
      },
    ],
  },
  {
    category: "PhD. Students",
    members: [
      {
        id: 5,
        name: "Emilio Flores",
        role: "PhD. Student",
        image: "/emilio_flores.jpeg",
        bio: "Emilio Flores is a PhD student specializing in applied mathematics and optimization theory. His work contributes to the theoretical foundations of metaheuristic algorithms and their practical applications.",
        expertise: ["Applied Mathematics", "Optimization Theory", "Metaheuristic Theory", "Mathematical Modeling"],
        publications: 62,
        hIndex: 14,
      },
      {
        id: 6,
        name: "Pablo Olivares",
        role: "PhD. Student",
        image: "/pablo-olivares.png",
        bio: "Pablo Olivares is a PhD student working on reinforcement learning applications in optimization algorithms. His research focuses on enhancing particle swarm optimization and other metaheuristics through intelligent learning mechanisms.",
        expertise: ["Reinforcement Learning", "Particle Swarm Optimization", "Learning-based Optimization", "Algorithm Enhancement"],
        publications: 14,
        hIndex: 6,
      },
      {
        id: 7,
        name: "Víctor Ríos",
        role: "PhD. Student",
        image: "/victor_rios.png",
        bio: "Víctor Ríos specializes in developing and implementing advanced optimization algorithms. His work includes search space reduction techniques, feature selection methods, and novel approaches to solving complex optimization problems.",
        expertise: ["Algorithm Development", "Search Space Reduction", "Feature Selection", "Optimization Techniques"],
        publications: 16,
        hIndex: 8,
      },
      {
        id: 8,
        name: "Omar Salinas",
        role: "PhD. Student",
        image: "/omar_salinas.png",
        bio: "Omar Salinas is a PhD student with extensive experience in applying optimization techniques to security operations. His research focuses on developing intelligent systems for threat detection and response in cybersecurity environments.",
        expertise: ["Cybersecurity", "Threat Detection", "Security Operations", "Many-objective Optimization"],
        publications: 15,
        hIndex: 8,
      },
      {
        id: 9,
        name: "Benjamín Serrano",
        role: "PhD. Student",
        image: "/benjamin_serrano.png",
        bio: "Benjamín Serrano is a PhD student contributing to various optimization projects. His work includes research on particle swarm optimization, feature selection algorithms, and search space optimization techniques.",
        expertise: ["Optimization", "Algorithm Testing", "Feature Selection", "Data Analysis"],
        publications: 8,
        hIndex: 4,
      },
    ],
  },
  {
    category: "Msc. Students",
    members: [
      {
        id: 10,
        name: "Sandy Iturra",
        role: "Msc. Student",
        image: "/sandy_iturra.png",
        bio: "Sandy Iturra is a Master's student contributing to research in bio-inspired optimization and machine learning techniques.",
        expertise: ["Optimization", "Machine Learning", "Research"],
        publications: 0,
        hIndex: 0,
      },
      {
        id: 11,
        name: "Sebastián M. Guzmán",
        role: "Msc. Student",
        image: "/sebastian_mguzman.png",
        bio: "Sebastián Guzmán bridges the gap between optimization algorithms and software engineering practices. His research focuses on applying machine learning and optimization techniques to agile methodologies.",
        expertise: ["Software Engineering", "Agile Methodologies", "Team Optimization", "Machine Learning Applications"],
        publications: 10,
        hIndex: 5,
      },
      {
        id: 12,
        name: "Camilo Ravelo",
        role: "Msc. Student",
        image: "/camilo_ravelo.png",
        bio: "Camilo Ravelo is a Master's student specializing in nature-inspired algorithms and their applications to optimization problems. His work on the Orca Predator Algorithm has shown significant contributions to metaheuristic optimization.",
        expertise: ["Nature-inspired Algorithms", "Orca Algorithm", "Feature Selection", "Algorithm Design"],
        publications: 18,
        hIndex: 9,
      },
    ],
  },
]

const collaborators = [principalInvestigator, ...collaboratorGroups.flatMap(g => g.members)]

function generateAbstract(paper: ParsedPaper): string {
  const templates = {
    'machine learning': "This research explores advanced machine learning techniques applied to {topic}. The study presents innovative methodologies that demonstrate significant improvements in {application}, providing comprehensive solutions for {domain} challenges.",
    'optimization': "This work presents novel optimization approaches for solving {topic}. The proposed methodology incorporates advanced algorithms that enhance performance and efficiency in {application}, with applications in {domain}.",
    'biomimetic': "This study introduces bio-inspired algorithms that mimic natural behaviors to solve {topic}. The research demonstrates how nature-inspired computational methods can effectively address {application} challenges in {domain}.",
    'cybersecurity': "This research addresses critical cybersecurity challenges through innovative approaches to {topic}. The study presents comprehensive security solutions that improve {application} while maintaining robust protection in {domain} environments.",
    'feature selection': "This work focuses on advanced feature selection techniques for {topic}. The proposed methods effectively identify relevant features while reducing dimensionality, improving {application} performance in {domain} applications.",
    'algorithms': "This research presents novel algorithmic approaches for {topic}. The study demonstrates enhanced computational efficiency and solution quality in {application}, with significant implications for {domain}."
  };

  // Select template based on keywords
  let template = templates['algorithms']; // default
  for (const keyword of paper.keywords) {
    if (templates[keyword as keyof typeof templates]) {
      template = templates[keyword as keyof typeof templates];
      break;
    }
  }

  // Extract topic from title
  const topic = paper.title.toLowerCase().includes('problem') ? 
    paper.title.toLowerCase().split(' problem')[0].split(' ').slice(-3).join(' ') + ' problem' :
    paper.keywords[0] || 'optimization problems';

  const application = paper.keywords[1] || 'problem solving';
  const domain = paper.type === 'article' ? 'research' : 'industrial';

  return template
    .replace('{topic}', topic)
    .replace('{application}', application)
    .replace('{domain}', domain);
}

export default function HomePage() {
  const [papers, setPapers] = useState<ParsedPaper[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedYear, setSelectedYear] = useState<string>("all")
  const [selectedType, setSelectedType] = useState<string>("all")
  const [selectedKeyword, setSelectedKeyword] = useState<string>("all")
  const [expandedAbstracts, setExpandedAbstracts] = useState<Set<string>>(new Set())
  const [selectedCollaborator, setSelectedCollaborator] = useState<(typeof collaborators)[0] | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [showOnlyFondecyt, setShowOnlyFondecyt] = useState(false)
  const [showTeam, setShowTeam] = useState(false)
  const articlesPerPage = 6

  useEffect(() => {
    const loadPapers = async () => {
      try {
        setLoading(true)
        const loadedPapers = await loadBibTeXFiles()
        setPapers(loadedPapers)
      } catch (error) {
        console.error('Error loading papers:', error)
      } finally {
        setLoading(false)
      }
    }

    loadPapers()
  }, [])

  const years = [...new Set(papers.map((p) => p.year))].sort((a, b) => b - a)
  const types = [...new Set(papers.map((p) => p.type))]
  const allKeywords = [...new Set(papers.flatMap((p) => p.keywords))]

  const filteredPapers = useMemo(() => {
    return papers.filter((paper) => {
      const matchesSearch =
        searchTerm === "" ||
        paper.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        paper.authors.some((author) => author.toLowerCase().includes(searchTerm.toLowerCase())) ||
        paper.keywords.some((keyword) => keyword.toLowerCase().includes(searchTerm.toLowerCase()))

      const matchesYear = selectedYear === "all" || paper.year.toString() === selectedYear
      const matchesType = selectedType === "all" || paper.type === selectedType
      const matchesKeyword = selectedKeyword === "all" || paper.keywords.includes(selectedKeyword)
      const matchesFondecyt = !showOnlyFondecyt || paper.isFondecyt

      return matchesSearch && matchesYear && matchesType && matchesKeyword && matchesFondecyt
    })
  }, [papers, searchTerm, selectedYear, selectedType, selectedKeyword, showOnlyFondecyt])

  const totalPages = Math.ceil(filteredPapers.length / articlesPerPage)
  const startIndex = (currentPage - 1) * articlesPerPage
  const endIndex = startIndex + articlesPerPage
  const currentPapers = filteredPapers.slice(startIndex, endIndex)

  useMemo(() => {
    setCurrentPage(1)
  }, [searchTerm, selectedYear, selectedType, selectedKeyword])

  const toggleAbstract = (paperId: string) => {
    const newExpanded = new Set(expandedAbstracts)
    if (newExpanded.has(paperId)) {
      newExpanded.delete(paperId)
    } else {
      newExpanded.add(paperId)
    }
    setExpandedAbstracts(newExpanded)
  }

  const goToPage = (page: number) => {
    setCurrentPage(page)
  }

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      goToPage(currentPage - 1)
    }
  }

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      goToPage(currentPage + 1)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading research papers...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/5 via-background to-accent/5 py-16 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex justify-center items-center gap-8 mb-8">
            <div className="flex items-center gap-2">
              <img
                src="https://uv.cl/images/descargas-corporativas/uv_logo_alta_rgba_azul-2023.png"
                alt="Universidad de Valparaíso"
                className="h-16 md:h-20 w-auto"
              />
            </div>
            <div className="flex items-center gap-2">
              <img
                src="https://investigacionypostgrado.fadeu.uc.cl/wp-content/uploads/2024/05/image-1024x533.png"
                alt="FONDECYT"
                className="h-16 md:h-20 w-auto"
              />
            </div>
          </div>

          <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-6 text-balance">
            Using artificial learning behaviors to intelligently balance the convergence and search procedures on
            bio-inspired optimization solvers
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-5xl mx-auto text-pretty leading-relaxed">
            The project aims to advance the field of combinatorial optimization by integrating sophisticated machine
            learning techniques with advanced metaheuristic algorithms. This integration seeks to create a dynamic
            balance between exploration and exploitation strategies, enhancing the efficiency and effectiveness of
            solving complex optimization problems. The project focuses on incorporating cutting-edge swarm intelligence
            methods, alongside other established optimization algorithms, to navigate and optimize in multidimensional
            solution spaces. This nuanced approach also includes mechanisms to reduce the exploration of unviable
            regions, a response to critical insights gathered from prior evaluations and feedback on the project.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Badge variant="secondary" className="text-sm px-4 py-2">
              <BookOpen className="w-4 h-4 mr-2" />
              {papers.length} Research Papers
            </Badge>
            <button
              onClick={() => setShowOnlyFondecyt(!showOnlyFondecyt)}
              className={`flex items-center gap-2 text-sm px-4 py-2 rounded-full border transition-colors ${
                showOnlyFondecyt
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background text-foreground border-border hover:bg-muted"
              }`}
            >
              <Filter className="w-4 h-4" />
              FONDECYT
            </button>
            <Badge variant="outline" className="text-sm px-4 py-2">
              <Calendar className="w-4 h-4 mr-2" />
              {years.length > 0 ? `${Math.min(...years)}-${Math.max(...years)}` : '2023-2024'}
            </Badge>
          </div>
        </div>
      </section>

      {/* Search and Filters */}
      <section className="py-8 px-4 border-b">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search papers, authors, or keywords..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Years</SelectItem>
                  {years.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {types.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type === "article" ? "Journal Article" : "Conference Paper"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedKeyword} onValueChange={setSelectedKeyword}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Keywords" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Keywords</SelectItem>
                  {allKeywords.map((keyword) => (
                    <SelectItem key={keyword} value={keyword}>
                      {keyword}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </section>

      {/* Collaborators Section */}
      <section className="py-8 px-4 bg-muted/20">
        <div className="max-w-6xl mx-auto">
          <button
            onClick={() => setShowTeam(!showTeam)}
            className="w-full flex items-center justify-between text-left mb-4"
          >
            <div>
              <h2 className="text-3xl font-bold text-foreground">Research Team</h2>
              <p className="text-muted-foreground text-sm mt-1">
                {showTeam ? "Click to collapse" : "Click to expand"}
              </p>
            </div>
            <ChevronDown className={`w-6 h-6 text-muted-foreground transition-transform duration-200 ${showTeam ? "rotate-180" : ""}`} />
          </button>

          {showTeam && (
          <>
          {/* Principal Investigator */}
          <div className="flex justify-center mb-10">
            <div
              className="group cursor-pointer text-center"
              onClick={() => setSelectedCollaborator(principalInvestigator)}
            >
              <div className="relative overflow-hidden rounded-full w-40 h-40 mx-auto mb-4 group-hover:scale-105 transition-transform duration-300">
                <img
                  src={principalInvestigator.image || "/placeholder.svg"}
                  alt={principalInvestigator.name}
                  className={`w-full h-full object-cover group-hover:brightness-110 transition-all duration-300 ${'imagePosition' in principalInvestigator ? principalInvestigator.imagePosition : ''}`}
                />
                <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <span className="text-white text-xs font-medium">Ver perfil</span>
                </div>
              </div>
              <h3 className="font-semibold text-sm group-hover:text-primary transition-colors">{principalInvestigator.name}</h3>
              <p className="text-xs text-muted-foreground mt-1">{principalInvestigator.role}</p>
            </div>
          </div>

          {/* Category Groups */}
          {collaboratorGroups.map((group) => (
            <div key={group.category} className="mb-10">
              <h3 className="text-xl font-semibold text-foreground mb-6 border-b pb-2">{group.category}</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {group.members.map((collaborator) => {
                  const isClickable = group.category === "Collaborators"
                  return (
                    <div
                      key={collaborator.id}
                      className={`group ${isClickable ? 'cursor-pointer' : ''}`}
                      onClick={isClickable ? () => setSelectedCollaborator(collaborator) : undefined}
                    >
                      <div className="relative overflow-hidden rounded-full w-40 h-40 mx-auto mb-4 group-hover:scale-105 transition-transform duration-300">
                        <img
                          src={collaborator.image || "/placeholder.svg"}
                          alt={collaborator.name}
                          className={`w-full h-full object-cover transition-all duration-300 ${'imagePosition' in collaborator ? collaborator.imagePosition : ''} ${isClickable ? 'group-hover:brightness-110' : ''}`}
                        />
                        {isClickable && (
                          <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                            <span className="text-white text-xs font-medium">View profile</span>
                          </div>
                        )}
                      </div>
                      <div className="text-center">
                        <h3 className={`font-semibold text-sm transition-colors ${isClickable ? 'group-hover:text-primary' : ''}`}>
                          {collaborator.name}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-1">{collaborator.role}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
          </>
          )}
        </div>
      </section>

      {/* Papers Grid */}
      <section className="py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-2">Research Papers ({filteredPapers.length})</h2>
            <p className="text-muted-foreground">
              {searchTerm && `Showing results for "${searchTerm}"`}
              {filteredPapers.length > 0 && (
                <span className="ml-2">
                  Page {currentPage} of {totalPages} ({startIndex + 1}-{Math.min(endIndex, filteredPapers.length)} of{" "}
                  {filteredPapers.length} articles)
                </span>
              )}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentPapers.map((paper) => {
              const isExpanded = expandedAbstracts.has(paper.id)
              const abstract = generateAbstract(paper)
              const shouldTruncate = abstract.length > 150
              const displayAbstract =
                isExpanded || !shouldTruncate ? abstract : `${abstract.substring(0, 150)}...`

              return (
                <Card key={paper.id} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <Badge variant={paper.type === "article" ? "default" : "secondary"} className="text-xs">
                        {paper.type === "article" ? "Journal" : "Conference"}
                      </Badge>
                      <span className="text-sm text-muted-foreground">{paper.year}</span>
                    </div>
                    <CardTitle className="text-lg leading-tight group-hover:text-primary transition-colors">
                      {paper.title}
                    </CardTitle>
                    <CardDescription className="text-sm">
                      <Users className="w-3 h-3 inline mr-1" />
                      {paper.authors.slice(0, 2).join(", ")}
                      {paper.authors.length > 2 && ` +${paper.authors.length - 2} more`}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      <div className="text-sm text-muted-foreground">
                        <p className={isExpanded ? "" : "line-clamp-3"}>{displayAbstract}</p>
                        {shouldTruncate && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleAbstract(paper.id)}
                            className="mt-2 p-0 h-auto text-primary hover:text-primary/80"
                          >
                            {isExpanded ? (
                              <>
                                Show less <ChevronUp className="w-3 h-3 ml-1" />
                              </>
                            ) : (
                              <>
                                Show more <ChevronDown className="w-3 h-3 ml-1" />
                              </>
                            )}
                          </Button>
                        )}
                      </div>

                      <div className="text-sm text-muted-foreground">
                        <strong>{paper.journal}</strong>
                        {paper.volume && ` ${paper.volume}`}
                        {paper.pages && `, pp. ${paper.pages}`}
                      </div>

                      <div className="flex flex-wrap gap-1">
                        {paper.keywords.slice(0, 3).map((keyword) => (
                          <Badge key={keyword} variant="outline" className="text-xs">
                            {keyword}
                          </Badge>
                        ))}
                        {paper.keywords.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{paper.keywords.length - 3}
                          </Badge>
                        )}
                      </div>

                      <div className="flex gap-2 pt-2">
                        {paper.url ? (
                          <Button size="sm" variant="outline" className="flex-1 bg-transparent" asChild>
                            <a href={paper.url} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="w-3 h-3 mr-1" />
                              View
                            </a>
                          </Button>
                        ) : (
                          <div className="flex-1 flex items-center justify-center gap-1.5 rounded-md border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs text-amber-700 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-400">
                            <Clock className="w-3 h-3" />
                            Under Review
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {filteredPapers.length > articlesPerPage && (
            <div className="flex justify-center items-center gap-2 mt-8">
              <Button
                variant="outline"
                size="sm"
                onClick={goToPreviousPage}
                disabled={currentPage === 1}
                className="flex items-center gap-1 bg-transparent"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </Button>

              <div className="flex gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => goToPage(page)}
                    className="w-10"
                  >
                    {page}
                  </Button>
                ))}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={goToNextPage}
                disabled={currentPage === totalPages}
                className="flex items-center gap-1 bg-transparent"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}

          {filteredPapers.length === 0 && !loading && (
            <div className="text-center py-12">
              <div className="text-muted-foreground mb-4">
                <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg">No papers found</p>
                <p className="text-sm">Try adjusting your search criteria</p>
              </div>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("")
                  setSelectedYear("all")
                  setSelectedType("all")
                  setSelectedKeyword("all")
                }}
              >
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Collaborator Modal */}
      <Dialog open={!!selectedCollaborator} onOpenChange={() => setSelectedCollaborator(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          {selectedCollaborator && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl">{selectedCollaborator.name}</DialogTitle>
              </DialogHeader>

              <div className="space-y-6">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex-shrink-0">
                    <img
                      src={selectedCollaborator.image || "/placeholder.svg"}
                      alt={selectedCollaborator.name}
                      className={`w-32 h-32 rounded-full object-cover mx-auto md:mx-0 ${'imagePosition' in selectedCollaborator ? selectedCollaborator.imagePosition : ''}`}
                    />
                  </div>

                  <div className="flex-1 space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold text-primary">{selectedCollaborator.role}</h3>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-muted/50 rounded-lg">
                        <div className="text-2xl font-bold text-primary">{selectedCollaborator.publications}</div>
                        <div className="text-sm text-muted-foreground">Publications</div>
                      </div>
                      <div className="text-center p-3 bg-muted/50 rounded-lg">
                        <div className="text-2xl font-bold text-primary">{selectedCollaborator.hIndex}</div>
                        <div className="text-sm text-muted-foreground">H-Index</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Biography</h4>
                  <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-line">{selectedCollaborator.bio}</p>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Areas of Expertise</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedCollaborator.expertise.map((area) => (
                      <Badge key={area} variant="secondary" className="text-xs">
                        {area}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Footer */}
      <footer className="bg-muted/30 py-8 px-4 mt-16">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex justify-center items-center gap-6 mb-4">
            <img
              src="https://uv.cl/images/descargas-corporativas/uv_logo_alta_rgba_azul-2023.png"
              alt="Universidad de Valparaíso"
              className="h-10 w-auto opacity-70"
            />
            <img
              src="https://investigacionypostgrado.fadeu.uc.cl/wp-content/uploads/2024/05/image-1024x533.png"
              alt="FONDECYT"
              className="h-10 w-auto opacity-70"
            />
          </div>
          <p className="text-muted-foreground">
            © 2026 Academic Research Showcase. Featuring research by Rodrigo Olivares and collaborators.
          </p>
        </div>
      </footer>
    </div>
  )
}