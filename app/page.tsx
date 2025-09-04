"use client"

import { useState, useMemo, useEffect } from "react"
import {
  Search,
  ExternalLink,
  Calendar,
  Users,
  BookOpen,
  Download,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Loader2,
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
}

// Collaborators data
const collaborators = [
  {
    id: 1,
    name: "Rodrigo Olivares",
    role: "Principal Investigator",
    affiliation: "Universidad de Valparaíso",
    email: "rodrigo.olivares@uv.cl",
    image: "/professional-researcher-portrait.png",
    bio: "Dr. Rodrigo Olivares is a leading researcher in biomimetic algorithms and optimization techniques. His work focuses on applying nature-inspired computational methods to solve complex engineering and computer science problems. He has published extensively in top-tier journals and conferences, with particular expertise in particle swarm optimization, feature selection, and cybersecurity applications.",
    expertise: ["Biomimetic Algorithms", "Optimization", "Machine Learning", "Cybersecurity"],
    publications: 50,
    hIndex: 15,
  },
  {
    id: 2,
    name: "Fabian Riquelme",
    role: "Research Scientist",
    affiliation: "Universidad de Valparaíso",
    email: "fabian.riquelme@uv.cl",
    image: "/academic-professor-portrait.png",
    bio: "Dr. Fabian Riquelme specializes in social network analysis and multi-objective optimization. His research focuses on influence maximization problems and the application of swarm intelligence methods to complex social networks. He has made significant contributions to understanding information diffusion and viral marketing strategies.",
    expertise: ["Social Network Analysis", "Multi-objective Optimization", "Influence Maximization", "Swarm Intelligence"],
    publications: 25,
    hIndex: 12,
  },
  {
    id: 3,
    name: "Broderick Crawford",
    role: "Co-Investigator",
    affiliation: "Universidad de Valparaíso",
    email: "broderick.crawford@uv.cl",
    image: "/computer-science-professor-portrait.png",
    bio: "Dr. Broderick Crawford is a renowned expert in computational intelligence and software engineering. His research focuses on the intersection of artificial intelligence and software development, with significant contributions to evolutionary algorithms and their applications in real-world problems.",
    expertise: ["Computational Intelligence", "Software Engineering", "Evolutionary Algorithms", "AI Applications"],
    publications: 120,
    hIndex: 22,
  },
  {
    id: 4,
    name: "Ricardo Soto",
    role: "Co-Investigator",
    affiliation: "Universidad de Valparaíso",
    email: "ricardo.soto@uv.cl",
    image: "/academic-professor-portrait.png",
    bio: "Dr. Ricardo Soto is a distinguished professor and researcher specializing in constraint programming and metaheuristic algorithms. His research contributions span multiple domains including artificial intelligence, operations research, and computational optimization. He has been instrumental in developing novel approaches to combinatorial optimization problems.",
    expertise: ["Constraint Programming", "Metaheuristics", "Artificial Intelligence", "Operations Research"],
    publications: 150,
    hIndex: 25,
  },
  {
    id: 5,
    name: "Omar Salinas",
    role: "Cybersecurity Specialist",
    affiliation: "Universidad de Valparaíso",
    email: "omar.salinas@uv.cl",
    image: "/cybersecurity-expert-portrait.png",
    bio: "Omar Salinas is a cybersecurity expert with extensive experience in applying optimization techniques to security operations. His research focuses on developing intelligent systems for threat detection and response in cybersecurity environments using many-objective optimization strategies.",
    expertise: ["Cybersecurity", "Threat Detection", "Security Operations", "Many-objective Optimization"],
    publications: 15,
    hIndex: 8,
  },
  {
    id: 6,
    name: "Camilo Ravelo",
    role: "Research Associate",
    affiliation: "Universidad de Valparaíso",
    email: "camilo.ravelo@uv.cl",
    image: "/young-researcher-portrait.png",
    bio: "Camilo Ravelo is a promising researcher specializing in nature-inspired algorithms and their applications to optimization problems. His work on the Orca Predator Algorithm has shown significant contributions to the field of metaheuristic optimization and feature selection.",
    expertise: ["Nature-inspired Algorithms", "Orca Algorithm", "Feature Selection", "Algorithm Design"],
    publications: 18,
    hIndex: 9,
  },
  {
    id: 7,
    name: "Nicolas Caselli",
    role: "Machine Learning Researcher",
    affiliation: "Universidad de Valparaíso",
    email: "nicolas.caselli@uv.cl",
    image: "/software-engineer-researcher-portrait.png",
    bio: "Nicolas Caselli focuses on machine learning applications in bio-inspired algorithms. His research involves developing self-adaptive mechanisms and dynamic population management techniques for global optimization problems using advanced machine learning models.",
    expertise: ["Machine Learning", "Self-adaptive Algorithms", "Dynamic Population", "Global Optimization"],
    publications: 12,
    hIndex: 7,
  },
  {
    id: 8,
    name: "Sergio Valdivia",
    role: "Optimization Researcher",
    affiliation: "Universidad de Valparaíso",
    email: "sergio.valdivia@uv.cl",
    image: "/academic-professor-portrait.png",
    bio: "Sergio Valdivia specializes in clustering-based optimization methods and combinatorial problem solving. His work focuses on developing novel binarization methods for metaheuristic algorithms applied to 0/1 combinatorial problems.",
    expertise: ["Clustering Methods", "Combinatorial Optimization", "Binarization Techniques", "Metaheuristics"],
    publications: 20,
    hIndex: 10,
  },
  {
    id: 9,
    name: "Pablo Olivares",
    role: "Research Associate",
    affiliation: "Universidad de Valparaíso",
    email: "pablo.olivares@uv.cl",
    image: "/young-researcher-portrait.png",
    bio: "Pablo Olivares is a research associate working on reinforcement learning applications in optimization algorithms. His research focuses on enhancing particle swarm optimization and other metaheuristics through intelligent learning mechanisms.",
    expertise: ["Reinforcement Learning", "Particle Swarm Optimization", "Learning-based Optimization", "Algorithm Enhancement"],
    publications: 14,
    hIndex: 6,
  },
  {
    id: 10,
    name: "Victor Rios",
    role: "Algorithm Developer",
    affiliation: "Universidad de Valparaíso",
    email: "victor.rios@uv.cl",
    image: "/computer-science-professor-portrait.png",
    bio: "Victor Rios specializes in developing and implementing advanced optimization algorithms. His work includes search space reduction techniques, feature selection methods, and novel approaches to solving complex optimization problems.",
    expertise: ["Algorithm Development", "Search Space Reduction", "Feature Selection", "Optimization Techniques"],
    publications: 16,
    hIndex: 8,
  },
  {
    id: 11,
    name: "Sebastian Guzman",
    role: "Software Engineering Researcher",
    affiliation: "Universidad de Valparaíso",
    email: "sebastian.guzman@uv.cl",
    image: "/software-engineer-researcher-portrait.png",
    bio: "Sebastian Guzman bridges the gap between optimization algorithms and software engineering practices. His research focuses on applying machine learning and optimization techniques to agile methodologies and team optimization in software development.",
    expertise: ["Software Engineering", "Agile Methodologies", "Team Optimization", "Machine Learning Applications"],
    publications: 10,
    hIndex: 5,
  },
  {
    id: 12,
    name: "Benjamin Serrano",
    role: "Junior Researcher",
    affiliation: "Universidad de Valparaíso",
    email: "benjamin.serrano@uv.cl",
    image: "/young-researcher-portrait.png",
    bio: "Benjamin Serrano is a junior researcher contributing to various optimization projects. His work includes supporting research on particle swarm optimization, feature selection algorithms, and search space optimization techniques for complex problem solving.",
    expertise: ["Optimization Support", "Algorithm Testing", "Research Assistance", "Data Analysis"],
    publications: 8,
    hIndex: 4,
  },
  {
    id: 13,
    name: "Roberto Muñoz",
    role: "Senior Researcher",
    affiliation: "Universidad de Valparaíso",
    email: "roberto.munoz@uv.cl",
    image: "/senior-researcher-portrait.png",
    bio: "Dr. Roberto Muñoz is a senior researcher with extensive experience in computational intelligence and optimization techniques. His research focuses on developing advanced algorithms for complex problem-solving scenarios, with particular expertise in evolutionary computation and hybrid optimization approaches.",
    expertise: ["Computational Intelligence", "Evolutionary Computation", "Hybrid Optimization", "Complex Systems"],
    publications: 85,
    hIndex: 18,
  },
  {
    id: 14,
    name: "Emilio Flores",
    role: "Research Scientist",
    affiliation: "Universidad de Valparaíso",
    email: "emilio.flores@uv.cl",
    image: "/research-scientist-portrait.png",
    bio: "Dr. Emilio Flores is a research scientist specializing in applied mathematics and optimization theory. His work contributes significantly to the theoretical foundations of metaheuristic algorithms and their practical applications in engineering and computer science domains.",
    expertise: ["Applied Mathematics", "Optimization Theory", "Metaheuristic Theory", "Mathematical Modeling"],
    publications: 62,
    hIndex: 14,
  },
]

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
  const [teamCurrentPage, setTeamCurrentPage] = useState(0)
  const articlesPerPage = 6
  const membersPerPage = 5

  // Team pagination computed values
  const totalTeamPages = Math.ceil(collaborators.length / membersPerPage)
  const currentTeamMembers = collaborators.slice(
    teamCurrentPage * membersPerPage,
    (teamCurrentPage + 1) * membersPerPage
  )

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

      return matchesSearch && matchesYear && matchesType && matchesKeyword
    })
  }, [papers, searchTerm, selectedYear, selectedType, selectedKeyword])

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
      <section className="py-12 px-4 bg-muted/20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Research Team</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Meet our dedicated team of researchers and collaborators working on cutting-edge optimization and machine
              learning projects.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-8">
            {currentTeamMembers.map((collaborator) => (
              <div
                key={collaborator.id}
                className="group cursor-pointer"
                onClick={() => setSelectedCollaborator(collaborator)}
              >
                <div className="relative overflow-hidden rounded-full aspect-square mb-4 group-hover:scale-105 transition-transform duration-300">
                  <img
                    src={collaborator.image || "/placeholder.svg"}
                    alt={collaborator.name}
                    className="w-full h-full object-cover group-hover:brightness-110 transition-all duration-300"
                  />
                  <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <span className="text-white text-sm font-medium">Ver perfil</span>
                  </div>
                </div>
                <div className="text-center">
                  <h3 className="font-semibold text-sm group-hover:text-primary transition-colors">
                    {collaborator.name}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">{collaborator.role}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Navigation Controls */}
          <div className="flex justify-center items-center space-x-4">
            <button
              onClick={() => setTeamCurrentPage(teamCurrentPage - 1)}
              disabled={teamCurrentPage === 0}
              className="px-4 py-2 rounded-lg border border-border bg-background hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              ← Anterior
            </button>
            
            <div className="flex space-x-2">
              {Array.from({ length: totalTeamPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setTeamCurrentPage(i)}
                  className={`w-8 h-8 rounded-full transition-colors ${
                    teamCurrentPage === i
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-background border border-border hover:bg-muted'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>

            <button
              onClick={() => setTeamCurrentPage(teamCurrentPage + 1)}
              disabled={teamCurrentPage >= totalTeamPages - 1}
              className="px-4 py-2 rounded-lg border border-border bg-background hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Siguiente →
            </button>
          </div>
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
                  Página {currentPage} de {totalPages} ({startIndex + 1}-{Math.min(endIndex, filteredPapers.length)} de{" "}
                  {filteredPapers.length} artículos)
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
                                Ver menos <ChevronUp className="w-3 h-3 ml-1" />
                              </>
                            ) : (
                              <>
                                Ver más <ChevronDown className="w-3 h-3 ml-1" />
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
                        <Button size="sm" variant="outline" className="flex-1 bg-transparent" asChild>
                          <a href={paper.url || '#'} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="w-3 h-3 mr-1" />
                            View
                          </a>
                        </Button>
                        <Button size="sm" variant="ghost" className="px-3">
                          <Download className="w-3 h-3" />
                        </Button>
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
                Anterior
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
                Siguiente
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
                      className="w-32 h-32 rounded-full object-cover mx-auto md:mx-0"
                    />
                  </div>

                  <div className="flex-1 space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold text-primary">{selectedCollaborator.role}</h3>
                      <p className="text-muted-foreground">{selectedCollaborator.affiliation}</p>
                      <p className="text-sm text-muted-foreground">{selectedCollaborator.email}</p>
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
                  <p className="text-muted-foreground text-sm leading-relaxed">{selectedCollaborator.bio}</p>
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
            © 2024 Academic Research Showcase. Featuring research by Rodrigo Olivares and collaborators.
          </p>
        </div>
      </footer>
    </div>
  )
}