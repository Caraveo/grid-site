"use client";

import { useEffect, useMemo, useState } from "react";

type Lesson = {
  id: string;
  number: string;
  title: string;
  eyebrow: string;
  duration: string;
  level: string;
  summary: string;
  outcomes: string[];
  sections: { title: string; paragraphs: string[]; callout?: string }[];
  links: { label: string; href: string }[];
  quiz: {
    question: string;
    choices: string[];
    answer: number;
    explanation: string;
  }[];
};

const lessons: Lesson[] = [
  {
    id: "why-grid",
    number: "01",
    title: "Why GRID exists",
    eyebrow: "Mission + problem",
    duration: "9 min",
    level: "Foundation",
    summary: "Start with the problem: useful compute is abundant, but access, coordination, proof, and payment remain fragmented.",
    outcomes: ["Explain GRID in one sentence", "Separate the present pilot from the long-term vision", "Describe useful compute without token hype"],
    sections: [
      {
        title: "The unused-machine problem",
        paragraphs: [
          "Computing power is everywhere: personal machines, workstations, small racks, independent datacenters, and specialized GPUs. Yet most of it cannot participate in a shared market because discovery, trust, scheduling, measurement, and settlement live in separate systems.",
          "GRID is an attempt to make those machines legible to one another. It coordinates identities, available resources, authorized work, evidence, and rewards so independently owned hardware can behave like a useful compute fabric.",
        ],
        callout: "GRID is the coordination network. It is not merely a coin, a cloud reseller, or proof-of-work with a new name.",
      },
      {
        title: "Useful work with honest boundaries",
        paragraphs: [
          "The central promise is verifiable useful work: hosts execute approved workloads, miners protect and verify network activity, and receipts make contribution inspectable. The network should reward measurable service instead of consuming power solely to win a hash race.",
          "Phase 1 still has centralized responsibilities. Genesis coordinates and finalizes parts of the pilot while the protocol, evidence model, and operating practices mature. School materials describe what runs now and distinguish it from what GRID intends to decentralize later.",
        ],
      },
    ],
    links: [{ label: "Plain-English explanation", href: "/explain" }, { label: "Read the mission", href: "/#mission" }],
    quiz: [
      { question: "What is GRID primarily coordinating?", choices: ["Only token trades", "Independent compute, proof, identity, and settlement", "A social network", "Cloud storage subscriptions"], answer: 1, explanation: "GRID joins machines and useful work with identity, evidence, and settlement." },
      { question: "What is the honest description of Phase 1?", choices: ["Fully decentralized finality", "A finished global cloud", "A working pilot with Genesis responsibilities", "A mining pool"], answer: 2, explanation: "Genesis still coordinates and finalizes parts of the running pilot." },
    ],
  },
  {
    id: "architecture",
    number: "02",
    title: "The map of GRID",
    eyebrow: "GRID + MESH + Phoenix",
    duration: "12 min",
    level: "Foundation",
    summary: "Learn the names, layers, and roles that turn a collection of machines into a coherent network.",
    outcomes: ["Tell GRID from MESH", "Describe Genesis, Phoenix, nodes, and realms", "Trace a request through the system"],
    sections: [
      {
        title: "Network, browser, and realm",
        paragraphs: [
          "GRID is the underlying coordination and compute network. MESH is the human-facing access layer: the software and naming experience used to reach resources without treating raw infrastructure addresses as the product.",
          "A realm is a registered public name within that experience. It can point people toward a service running through GRID. The registry makes names discoverable; the mesh and participating nodes make the destination reachable.",
        ],
        callout: "Keep the pair simple: GRID coordinates the network; MESH helps people navigate it.",
      },
      {
        title: "Genesis and Phoenix",
        paragraphs: [
          "Genesis is the current Phase 1 anchor. It exposes coordination data and provides finalization while the network grows. Phoenix is the native GRID Wallet: a desktop app for encrypted custody, GRID balances and transfers, mining reward claims, and Solana reward routing.",
          "The intended direction is outward: more independently operated peers, more reproducible services, and less reliance on a single center. Decentralization is treated as an engineering migration with visible milestones, not a slogan.",
        ],
      },
    ],
    links: [{ label: "Explore the architecture", href: "/explain" }, { label: "Get Phoenix", href: "/phoenix" }],
    quiz: [
      { question: "What is MESH?", choices: ["The token ledger", "The browser and access layer", "A GPU benchmark", "The admin dashboard"], answer: 1, explanation: "MESH is the access and navigation experience layered over GRID." },
      { question: "What is Phoenix?", choices: ["The native GRID Wallet", "A Discord bot", "A centralized exchange", "The public registry"], answer: 0, explanation: "Phoenix is the native desktop wallet for GRID custody, rewards, and settlement routing." },
    ],
  },
  {
    id: "work",
    number: "03",
    title: "Mining, hosting + compute",
    eyebrow: "Doing the work",
    duration: "14 min",
    level: "Operator",
    summary: "Understand the distinct jobs machines perform, how Proof of Resource fits, and why evidence matters.",
    outcomes: ["Separate miners from hosts", "Explain Proof of Resource", "Know what an operator is responsible for"],
    sections: [
      {
        title: "Two participation tracks",
        paragraphs: [
          "Hosts provide execution capacity for authorized container workloads. They are the machines doing useful jobs. Miners perform slower, capped security and verification work that helps preserve signed history and inspect network activity.",
          "The roles can exist on one machine, but they are not interchangeable. Hosting is about serving work reliably. Mining is about contributing to verification and network security. GRID measures and rewards them according to different responsibilities.",
        ],
      },
      {
        title: "Proof of Resource",
        paragraphs: [
          "Proof of Resource is the evidence layer connecting a claimed contribution to measurable work. A receipt should describe what was authorized, what ran, what resources were involved, and what result can be checked without exposing unnecessary private data.",
          "The goal is not perfect trustlessness by declaration. It is progressively stronger evidence: signed identities, reproducible rules, bounded workloads, inspectable receipts, peer checks, and settlement that follows verified contribution.",
        ],
        callout: "Useful work is only useful to the network when the authorization, measurement, and evidence are credible.",
      },
    ],
    links: [{ label: "Mining guide", href: "/mine" }, { label: "Proof of Resource", href: "/por" }, { label: "Quick start", href: "/quick" }],
    quiz: [
      { question: "Which role executes authorized container jobs?", choices: ["Host", "Moderator", "Realm", "Wallet"], answer: 0, explanation: "Hosts provide execution capacity for useful workloads." },
      { question: "Why does Proof of Resource exist?", choices: ["To create usernames", "To connect contribution claims to checkable evidence", "To replace documentation", "To run Discord"], answer: 1, explanation: "PoR is the evidence model for measured, verifiable contribution." },
    ],
  },
  {
    id: "p2p",
    number: "04",
    title: "P2P, identity + security",
    eyebrow: "Trust architecture",
    duration: "13 min",
    level: "Technical",
    summary: "Follow peers, signatures, registry identities, sessions, and Bitcoin’s settlement role through the trust model.",
    outcomes: ["Explain what peers exchange", "Understand identity and signed state", "Describe the Transact Security Layer"],
    sections: [
      {
        title: "Peers and signed history",
        paragraphs: [
          "Peer-to-peer participation lets nodes discover one another, exchange allowed network state, and inspect signed history without depending on a private dashboard as the source of truth. Peers should validate what they receive instead of blindly relaying it.",
          "Identity gives signatures meaning. Registered names, node keys, contributor accounts, passkeys, authenticator 2FA, and scoped sessions solve different parts of the same problem: who is acting, what are they allowed to do, and can that action be audited?",
        ],
      },
      {
        title: "Bitcoin as the settlement boundary",
        paragraphs: [
          "GRID meters network activity and useful work. Bitcoin is positioned as a Transact Security Layer for higher-value settlement and the eventual cash-out path. The two systems have different jobs: GRID coordinates service; Bitcoin anchors value.",
          "Security also means refusing bad inputs and bad incentives. Workloads must be authorized, secrets must remain scoped, administrative actions need stronger authentication, and public APIs should expose useful state without leaking private contributor or operator information.",
        ],
        callout: "Security is a chain of boundaries—identity, authorization, execution, evidence, replication, and settlement.",
      },
    ],
    links: [{ label: "Security documentation", href: "/docs/security" }, { label: "Network documentation", href: "/docs/network" }, { label: "Registry", href: "/registry" }],
    quiz: [
      { question: "What should a peer do with received state?", choices: ["Trust it automatically", "Validate it before accepting or relaying it", "Post it to Slack", "Convert it to Bitcoin"], answer: 1, explanation: "Peer verification is a basic boundary in a P2P system." },
      { question: "What is Bitcoin’s stated role in GRID?", choices: ["UI framework", "Transact Security Layer for settlement", "Realm registry", "Container scheduler"], answer: 1, explanation: "GRID meters work while Bitcoin anchors higher-value settlement." },
    ],
  },
  {
    id: "economics",
    number: "05",
    title: "Token, rewards + allocation",
    eyebrow: "Economics without fog",
    duration: "11 min",
    level: "Foundation",
    summary: "See what GRID measures, how rewards relate to contribution, and why public allocation matters.",
    outcomes: ["Describe token utility", "Read allocation claims critically", "Avoid confusing GRID with equity or Bitcoin"],
    sections: [
      {
        title: "A meter for network service",
        paragraphs: [
          "GRID is designed as a utility token for metering compute and rewarding verified participation. It is not company equity, a promise of profit, or a claim on Bitcoin. Its credibility depends on whether the network provides real service and measures contribution honestly.",
          "Hosts and miners do different work, so reward logic should reflect different costs, risks, and value. Caps, receipts, verification, and published rules are safeguards against turning an intended utility system into an unbounded issuance machine.",
        ],
      },
      {
        title: "Every allocation should be legible",
        paragraphs: [
          "Allocation explains where supply is intended to go: network participation, long-term building, public programs, operations, and other documented categories. The public should be able to distinguish locked or vested commitments from immediately circulating units.",
          "Good economic documentation does not ask readers to trust a pie chart. It names assumptions, authority, schedules, and what can still change. GRID publishes dedicated token and allocation pages so these claims can be challenged in context.",
        ],
      },
    ],
    links: [{ label: "Token overview", href: "/token?view=1" }, { label: "Allocation", href: "/alloc?view=1" }, { label: "Earning guide", href: "/docs/earn" }],
    quiz: [
      { question: "What is GRID intended to meter?", choices: ["Social followers", "Compute and verified network service", "Company ownership", "Fiat deposits"], answer: 1, explanation: "The utility thesis centers on measured network service." },
      { question: "Is GRID a claim on Bitcoin?", choices: ["Yes", "Only for contributors", "No", "Only during Phase 1"], answer: 2, explanation: "Bitcoin and GRID have distinct roles; GRID is not a claim on BTC." },
    ],
  },
  {
    id: "chip",
    number: "06",
    title: "What is a CHIP?",
    eyebrow: "A new crypto category",
    duration: "12 min",
    level: "Foundation",
    summary: "Learn why GRID uses CHIP—not token or coin alone—to describe computational utility with verifiable history and portable settlement.",
    outcomes: ["Define CHIP in plain language", "Compare a token, CHIP, and coin", "Trace CHIP-GRID through SOL toward BTC settlement"],
    sections: [
      {
        title: "What a CHIP is",
        paragraphs: [
          "CHIP means computational hybrid instrument. It describes utility created inside a compute network, evidenced by that network’s signed history, and made portable through an external token rail. A CHIP sits conceptually between a token and a coin without pretending that those categories are interchangeable.",
          "A token normally inherits another blockchain’s ledger. A coin is native to its own blockchain. CHIP-GRID begins with GRID’s own computational truth—authorized work, evidence, receipts, and signed network history—then uses established public networks for movement and durable settlement.",
        ],
        callout: "Token → CHIP ← Coin. CHIP-GRID → SOL token → BTC coin.",
      },
      {
        title: "Why CHIP exists",
        paragraphs: [
          "Crypto vocabulary often forces a project into one of two boxes. Calling GRID only a token hides the compute network that creates and verifies its utility. Calling it a coin implies a conventional native monetary blockchain and obscures the separate roles of Solana and Bitcoin.",
          "CHIP gives the crypto community a more precise category. GRID supplies computational utility and signed evidence. Solana supplies a fast public token rail. Bitcoin supplies the preferred final Transact Security Layer. The public model explains these roles without publishing private keys, anti-abuse controls, operator thresholds, or sensitive signing and deployment details.",
        ],
        callout: "CHIP exists to name where the utility comes from—not to manufacture a new promise of price or profit.",
      },
    ],
    links: [
      { label: "Read the CHIP definition", href: "/chip" },
      { label: "Token architecture", href: "/token?view=1" },
      { label: "Proof of Resource", href: "/por" },
    ],
    quiz: [
      {
        question: "What makes CHIP-GRID different from describing GRID only as a token?",
        choices: ["It guarantees a market price", "Its utility begins in GRID’s compute network and signed work history", "It replaces Solana", "It is company equity"],
        answer: 1,
        explanation: "The CHIP category preserves the origin of GRID utility: verified computation and signed network evidence.",
      },
      {
        question: "Which role mapping matches the public CHIP model?",
        choices: ["GRID is settlement, SOL is compute, BTC is identity", "GRID is utility, SOL is the token rail, BTC is final settlement", "GRID, SOL, and BTC are the same asset", "BTC schedules GRID containers"],
        answer: 1,
        explanation: "GRID creates and records computational utility, Solana carries public token ownership, and Bitcoin anchors the preferred settlement boundary.",
      },
    ],
  },
  {
    id: "api",
    number: "07",
    title: "Docs, CLI + public APIs",
    eyebrow: "Build with the network",
    duration: "15 min",
    level: "Builder",
    summary: "Learn how developers inspect state, register names, discover compute, read the explorer, and automate GRID.",
    outcomes: ["Navigate the documentation", "Know the major public API surfaces", "Choose between UI, CLI, and API"],
    sections: [
      {
        title: "Three ways into the system",
        paragraphs: [
          "The website explains and visualizes the network. The CLI gives operators repeatable commands for status, identity, mining, and services. Public APIs expose machine-readable registry, mesh, explorer, node, compute, and coordinator state for applications and diagnostics.",
          "A developer might query the mesh API to inspect live peer counts, the registry API to discover names or available compute, and the explorer API to read blocks and coordinator statistics. Mutating operations require stronger identity and authorization than public reads.",
        ],
        callout: "Public does not mean write-anything. Read surfaces can be open while claims, jobs, and administrative actions remain authenticated.",
      },
      {
        title: "Documentation is part of the protocol",
        paragraphs: [
          "Documentation defines the promises people build against. Examples should be runnable, response shapes should be explicit, and security boundaries should appear beside the endpoint rather than in a distant policy page.",
          "Contributors can improve GRID without touching consensus code by reproducing examples, clarifying errors, documenting edge cases, building client libraries, adding tests, and keeping guides aligned with the production API.",
        ],
      },
    ],
    links: [{ label: "Documentation home", href: "/docs" }, { label: "API examples", href: "/docs/examples" }, { label: "CLI guide", href: "/docs/cli" }, { label: "Explorer", href: "/explorer" }],
    quiz: [
      { question: "Which surface is best for automation?", choices: ["Only the homepage", "CLI and public APIs", "Discord reactions", "The news page"], answer: 1, explanation: "The CLI and APIs provide repeatable, machine-readable access." },
      { question: "Should public APIs allow anonymous administrative writes?", choices: ["Always", "No—writes need appropriate identity and authorization", "Only on weekends", "If the request is JSON"], answer: 1, explanation: "Public readability and privileged mutation are different trust levels." },
    ],
  },
  {
    id: "community",
    number: "08",
    title: "Contributors, Discord + Slack",
    eyebrow: "The human network",
    duration: "10 min",
    level: "Community",
    summary: "Understand how people enter the community, become approved contributors, coordinate work, and care for the commons.",
    outcomes: ["Choose Discord or Slack appropriately", "Explain contributor approval", "Identify non-code contribution paths"],
    sections: [
      {
        title: "Discord is the public commons",
        paragraphs: [
          "Discord is the open front door. It is where curious people can meet the community, ask questions, discuss the project, propose ideas, find events, and learn before taking on formal responsibility. Participation should be welcoming, searchable, and grounded in the work.",
          "Community managers and moderators are not decoration. They create healthy boundaries, connect questions to answers, de-escalate conflict, surface recurring problems, and make the project understandable to people who did not build it.",
        ],
      },
      {
        title: "Slack is the contributor workspace",
        paragraphs: [
          "Slack is for approved contributors coordinating accountable work: issue triage, releases, task ownership, moderation operations, documentation, working groups, and OTG production. It is a workspace, not the public face of the community.",
          "Approved contributors receive a secure dashboard, a gridmail.dev identity, tasks, mail, passkeys, and authenticator-based 2FA. Contribution paths include code, security, writing, translation, education, design, research, community stewardship, event organizing, QA, and project coordination.",
        ],
        callout: "Discord welcomes the public. Slack coordinates trusted work. Important public knowledge should still graduate into issues and documentation.",
      },
    ],
    links: [{ label: "Explore contributor paths", href: "/contribute" }, { label: "Read the open call", href: "/news/contribute" }, { label: "Join Discord", href: "https://discord.gg/nVs7NBCuqZ" }],
    quiz: [
      { question: "Where should a newcomer begin?", choices: ["Private admin APIs", "The public Discord and learning resources", "Contributor Slack without approval", "Production secrets"], answer: 1, explanation: "Discord is the public front door; School and docs provide context." },
      { question: "What is contributor Slack for?", choices: ["Public token promotion", "Accountable work coordination", "Anonymous mining", "Replacing documentation"], answer: 1, explanation: "Slack supports approved contributors doing active, owned work." },
    ],
  },
  {
    id: "roadmap",
    number: "09",
    title: "Roadmap + your next move",
    eyebrow: "From learning to action",
    duration: "8 min",
    level: "Graduation",
    summary: "Put the whole system together, understand what is unfinished, and choose a responsible way to participate.",
    outcomes: ["State what is live today", "Identify unfinished decentralization work", "Choose a concrete next action"],
    sections: [
      {
        title: "A network becomes real in phases",
        paragraphs: [
          "GRID’s roadmap moves from a working coordinated pilot toward broader independent operation. Each phase should increase reproducibility, peer participation, verifiable execution, operational resilience, and the ability for people outside the founding team to understand and maintain the system.",
          "The difficult work is not only technical. Governance, security response, contributor review, releases, community safety, event operations, documentation, economic clarity, and accessible interfaces all determine whether decentralization can survive contact with real users.",
        ],
      },
      {
        title: "Choose your lane",
        paragraphs: [
          "If you want to operate hardware, begin with the quick start and mining guide. If you want to manage GRID, install Phoenix. If you want to build software, read the API and architecture documentation and find a scoped issue. If you want to strengthen the human network, enter Discord, learn the norms, and request contributor access when you are ready to own work.",
          "Graduation from GRID School is not proof that you know everything. It means you can describe the system honestly, find primary documentation, recognize its current boundaries, and contribute without confusing enthusiasm for evidence.",
        ],
        callout: "The final lesson is operational humility: verify claims, document decisions, and leave the system easier for the next person to understand.",
      },
    ],
    links: [{ label: "View project phases", href: "/#timeline" }, { label: "Start operating", href: "/quick" }, { label: "Become a contributor", href: "/contribute" }],
    quiz: [
      { question: "What should each roadmap phase increase?", choices: ["Marketing ambiguity", "Reproducibility, verification, resilience, and independent participation", "Dependence on one dashboard", "Unbounded privileges"], answer: 1, explanation: "Those properties make outward decentralization concrete and testable." },
      { question: "What does graduating GRID School prove?", choices: ["You know every implementation detail", "You can describe the system honestly and find the evidence", "You are automatically an administrator", "You own GRID equity"], answer: 1, explanation: "The course builds accurate orientation and a responsible path into deeper work." },
    ],
  },
];

const STORAGE_KEY = "grid-school-progress-v1";

export function SchoolDashboard() {
  const [activeId, setActiveId] = useState(lessons[0].id);
  const [completed, setCompleted] = useState<string[]>([]);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}") as { completed?: string[]; scores?: Record<string, number> };
        setCompleted(saved.completed ?? []);
        setScores(saved.scores ?? {});
      } catch {}
      setHydrated(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (hydrated) localStorage.setItem(STORAGE_KEY, JSON.stringify({ completed, scores }));
  }, [completed, scores, hydrated]);

  const active = lessons.find((lesson) => lesson.id === activeId) ?? lessons[0];
  const progress = Math.round((completed.length / lessons.length) * 100);
  const graded = Object.values(scores);
  const average = graded.length ? Math.round(graded.reduce((sum, score) => sum + score, 0) / graded.length) : 0;
  const grade = average >= 90 ? "A" : average >= 80 ? "B" : average >= 70 ? "C" : average >= 60 ? "D" : graded.length ? "F" : "—";
  const quizScore = useMemo(
    () => active.quiz.reduce((score, question, index) => score + (answers[index] === question.answer ? 1 : 0), 0),
    [active, answers],
  );

  function openLesson(id: string) {
    setActiveId(id);
    setAnswers({});
    setSubmitted(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function submitQuiz() {
    if (Object.keys(answers).length !== active.quiz.length) return;
    const percent = Math.round((quizScore / active.quiz.length) * 100);
    setScores((current) => ({ ...current, [active.id]: percent }));
    if (percent >= 70) setCompleted((current) => current.includes(active.id) ? current : [...current, active.id]);
    setSubmitted(true);
  }

  const next = lessons[lessons.findIndex((lesson) => lesson.id === active.id) + 1];

  return (
    <main className="min-h-screen bg-background pt-16 text-foreground lg:pt-20">
      <header className="relative overflow-hidden border-b border-border px-5 py-14 sm:px-8 sm:py-20 lg:px-10">
        <div className="grid-bg pointer-events-none absolute inset-0 opacity-60" />
        <div className="pointer-events-none absolute right-[8%] top-[-10rem] h-[30rem] w-[30rem] rounded-full bg-emerald-300/10 blur-[100px]" />
        <div className="relative mx-auto max-w-7xl">
          <div className="flex flex-wrap items-center gap-3 font-mono text-[0.65rem] tracking-[0.18em] uppercase">
            <span className="border border-emerald-400/35 bg-emerald-300/10 px-3 py-1.5 text-emerald-400">GRID SCHOOL</span>
            <span className="text-muted">Course 001 · Open enrollment</span>
          </div>
          <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_24rem] lg:items-end">
            <div>
              <h1 className="max-w-4xl text-[clamp(3.5rem,9vw,7.8rem)] font-semibold leading-[0.84] tracking-[-0.07em]">
                Learn the
                <br />
                <span className="text-emerald-400">whole GRID.</span>
              </h1>
              <p className="mt-8 max-w-2xl text-lg leading-relaxed text-muted">
                Nine lessons from first principles to real participation. Read at your pace,
                pass each quiz with 70%, and leave knowing how the machine and human networks fit together.
              </p>
            </div>
            <div className="border border-border bg-surface p-6 backdrop-blur">
              <div className="flex items-end justify-between">
                <div><p className="font-mono text-[0.6rem] tracking-[0.16em] text-muted uppercase">Course progress</p><p className="mt-2 text-4xl font-semibold tracking-tight">{progress}%</p></div>
                <div className="text-right"><p className="font-mono text-[0.6rem] tracking-[0.16em] text-muted uppercase">Current grade</p><p className="mt-2 text-4xl font-semibold text-emerald-400">{grade}</p></div>
              </div>
              <div className="mt-6 h-2 overflow-hidden bg-foreground/10"><div className="h-full bg-emerald-400 transition-all duration-700" style={{ width: `${progress}%` }} /></div>
              <p className="mt-4 text-xs text-muted">{completed.length} of {lessons.length} lessons passed · {graded.length} quizzes graded</p>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-[94rem] lg:grid-cols-[21rem_minmax(0,1fr)]">
        <aside className="border-b border-border bg-surface lg:sticky lg:top-20 lg:h-[calc(100vh-5rem)] lg:overflow-y-auto lg:border-b-0 lg:border-r">
          <div className="border-b border-border p-5">
            <p className="font-mono text-[0.62rem] tracking-[0.18em] text-muted uppercase">Curriculum / 9 lessons</p>
          </div>
          <nav className="grid sm:grid-cols-2 lg:grid-cols-1">
            {lessons.map((lesson) => {
              const done = completed.includes(lesson.id);
              const selected = lesson.id === active.id;
              return (
                <button key={lesson.id} type="button" onClick={() => openLesson(lesson.id)} className={`group border-b border-border p-5 text-left transition ${selected ? "bg-emerald-300/10" : "hover:bg-foreground/[0.04]"}`}>
                  <div className="flex items-center justify-between font-mono text-[0.6rem] tracking-[0.14em] uppercase">
                    <span className={selected ? "text-emerald-400" : "text-muted"}>{lesson.number} · {lesson.duration}</span>
                    <span className={done ? "text-emerald-400" : "text-muted"}>{done ? `✓ ${scores[lesson.id]}%` : "○"}</span>
                  </div>
                  <h2 className="mt-3 text-sm font-semibold">{lesson.title}</h2>
                  <p className="mt-1 text-xs text-muted">{lesson.eyebrow}</p>
                </button>
              );
            })}
          </nav>
        </aside>

        <section className="min-w-0">
          <div className="border-b border-border px-5 py-12 sm:px-10 lg:px-14 lg:py-16">
            <div className="mx-auto max-w-4xl">
              <div className="flex flex-wrap items-center gap-3 font-mono text-[0.62rem] tracking-[0.15em] uppercase">
                <span className="text-emerald-400">Lesson {active.number}</span><span className="text-muted">/</span><span className="text-muted">{active.level}</span><span className="text-muted">/</span><span className="text-muted">{active.duration}</span>
              </div>
              <h2 className="mt-6 text-4xl font-semibold tracking-[-0.045em] sm:text-6xl">{active.title}</h2>
              <p className="mt-6 max-w-3xl text-lg leading-relaxed text-muted">{active.summary}</p>
              <div className="mt-9 grid gap-px border border-border bg-border sm:grid-cols-3">
                {active.outcomes.map((outcome, index) => <div key={outcome} className="bg-background p-4 text-xs leading-relaxed"><span className="mr-2 font-mono text-emerald-400">0{index + 1}</span>{outcome}</div>)}
              </div>
            </div>
          </div>

          <article className="px-5 py-12 sm:px-10 lg:px-14 lg:py-16">
            <div className="mx-auto max-w-4xl">
              {active.sections.map((section, index) => (
                <section key={section.title} className={index ? "mt-16 border-t border-border pt-16" : ""}>
                  <p className="font-mono text-[0.62rem] tracking-[0.17em] text-emerald-400 uppercase">{active.number}.{index + 1}</p>
                  <h3 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">{section.title}</h3>
                  <div className="mt-7 space-y-6 text-base leading-8 text-muted sm:text-lg sm:leading-9">
                    {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                  </div>
                  {section.callout && <blockquote className="mt-9 border-l-2 border-emerald-400 bg-emerald-300/[0.06] p-6 text-lg font-medium leading-relaxed">{section.callout}</blockquote>}
                </section>
              ))}

              <section className="mt-16 border-t border-border pt-12">
                <p className="font-mono text-[0.62rem] tracking-[0.17em] text-muted uppercase">Continue studying</p>
                <div className="mt-5 flex flex-wrap gap-3">
                  {active.links.map((link) => <a key={link.href} href={link.href} target={link.href.startsWith("http") ? "_blank" : undefined} rel={link.href.startsWith("http") ? "noreferrer" : undefined} className="border border-border bg-surface px-4 py-3 text-xs font-semibold transition hover:border-emerald-400/60 hover:text-emerald-400">{link.label} ↗</a>)}
                </div>
              </section>

              <section className="mt-20 border border-border bg-surface">
                <div className="border-b border-border p-6 sm:p-8">
                  <div className="flex flex-wrap items-end justify-between gap-5">
                    <div><p className="font-mono text-[0.62rem] tracking-[0.17em] text-amber-400 uppercase">Knowledge check</p><h3 className="mt-3 text-3xl font-semibold">Lesson {active.number} quiz</h3></div>
                    <span className="font-mono text-xs text-muted">PASSING SCORE / 70%</span>
                  </div>
                </div>
                <div className="space-y-10 p-6 sm:p-8">
                  {active.quiz.map((question, questionIndex) => (
                    <fieldset key={question.question}>
                      <legend className="text-base font-semibold leading-relaxed"><span className="mr-3 font-mono text-emerald-400">0{questionIndex + 1}</span>{question.question}</legend>
                      <div className="mt-4 grid gap-2 sm:grid-cols-2">
                        {question.choices.map((choice, choiceIndex) => {
                          const chosen = answers[questionIndex] === choiceIndex;
                          const correct = submitted && choiceIndex === question.answer;
                          const incorrect = submitted && chosen && choiceIndex !== question.answer;
                          return <button key={choice} type="button" disabled={submitted} onClick={() => setAnswers((current) => ({ ...current, [questionIndex]: choiceIndex }))} className={`min-h-14 border p-4 text-left text-sm transition ${correct ? "border-emerald-400 bg-emerald-300/10" : incorrect ? "border-red-400 bg-red-400/10" : chosen ? "border-amber-300 bg-amber-300/10" : "border-border bg-background hover:border-foreground/30"}`}><span className="mr-3 font-mono text-xs text-muted">{String.fromCharCode(65 + choiceIndex)}</span>{choice}</button>;
                        })}
                      </div>
                      {submitted && <p className="mt-3 text-sm leading-relaxed text-muted">{question.explanation}</p>}
                    </fieldset>
                  ))}
                  {submitted ? (
                    <div className={`border p-6 ${quizScore / active.quiz.length >= 0.7 ? "border-emerald-400/40 bg-emerald-300/10" : "border-amber-300/40 bg-amber-300/10"}`}>
                      <p className="font-mono text-xs tracking-[0.14em] uppercase">{quizScore / active.quiz.length >= 0.7 ? "Lesson passed" : "Review and try again"}</p>
                      <p className="mt-2 text-3xl font-semibold">{Math.round((quizScore / active.quiz.length) * 100)}%</p>
                      <div className="mt-5 flex flex-wrap gap-3">
                        {next && quizScore / active.quiz.length >= 0.7 && <button type="button" onClick={() => openLesson(next.id)} className="btn-primary">Next lesson →</button>}
                        <button type="button" onClick={() => { setAnswers({}); setSubmitted(false); }} className="btn-ghost">Retake quiz</button>
                      </div>
                    </div>
                  ) : (
                    <button type="button" onClick={submitQuiz} disabled={Object.keys(answers).length !== active.quiz.length} className="btn-primary disabled:cursor-not-allowed disabled:opacity-35">Grade my quiz</button>
                  )}
                </div>
              </section>
            </div>
          </article>
        </section>
      </div>
    </main>
  );
}
