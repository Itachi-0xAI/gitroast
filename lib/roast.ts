import Groq from "groq-sdk";

const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function generateRoast(payload: Record<string, unknown>): Promise<string> {
  const { profile, repos, commits } = payload as {
    profile: {
      name: string;
      username: string;
      bio: string;
      followers: number;
      following: number;
      publicRepos: number;
      accountAge: number;
      company: string;
      hireable: boolean;
    };
    repos: {
      total: number;
      emptyCount: number;
      forkedCount: number;
      languages: string[];
      topRepos: { name: string; stars: number; forks: number; size: number }[];
      readmeQuality: { repo: string; hasDescription: boolean }[];
    };
    commits: string[];
  };

  const dataStr = `
DEVELOPER PROFILE:
- Name: ${profile.name} (@${profile.username})
- Bio: ${profile.bio || "No bio. Too cool for introductions apparently."}
- Account age: ${profile.accountAge} years
- Followers: ${profile.followers}, Following: ${profile.following}
- Public repos: ${profile.publicRepos}
- Hireable: ${profile.hireable}
- Company: ${profile.company || "None listed"}

REPOS:
- Total: ${repos.total} repos
- Empty repos: ${repos.emptyCount}
- Forked (not original): ${repos.forkedCount}
- Languages used: ${repos.languages.join(", ") || "unknown"}
- Top repos: ${repos.topRepos.map((r) => `${r.name} (${r.stars}⭐, ${r.forks} forks, size: ${r.size}KB)`).join(", ")}
- Repos without descriptions: ${repos.readmeQuality.filter((r) => !r.hasDescription).length} out of ${repos.readmeQuality.length}

ACTUAL COMMIT MESSAGES (the real evidence):
${commits.map((m, i) => `${i + 1}. "${m}"`).join("\n")}
`;

  const completion = await client.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    max_tokens: 1024,
    messages: [
      {
        role: "system",
        content: `You are the most savage, brutally honest senior engineer on the internet doing a performance review based on a developer's GitHub profile. No mercy. No padding. Every single line must be a punch. Reference their actual data — repo names, commit messages, follower counts, empty repos. Make it hurt.

SCORING GUIDE (follow this strictly):
- 1-3/10: Mostly empty repos, terrible commits, years of inactivity, nothing original
- 4-5/10: Some effort but inconsistent, weak commit hygiene, few stars, abandoned projects
- 6-7/10: Solid developer, decent activity, real projects, some good repos
- 8-9/10: Impressive profile, strong contributions, good repos with stars and forks
- 10/10: Exceptional — reserved for legends only

RULES:
- Every bullet point and every section must be exactly ONE line. No exceptions.
- No long paragraphs. Everything is short, sharp, and brutal.
- Quote their actual commit messages directly. Name their actual repos.
- Do not be nice. Do not soften anything. Be specific and savage.
- NEVER start any line with "Why". No rhetorical questions anywhere.
- Start every line with a statement, a fact, or a direct burn. Not a question.
- Do not use filler openers like "Why are you", "Have you considered", "It seems like".
- Every roast must feel completely unique to this specific developer — no generic lines that could apply to anyone.
- The OVERALL RATING opener must be different every single time — vary the tone, metaphor, and style based on the actual profile. Sometimes dry, sometimes savage, sometimes darkly poetic, sometimes corporate, sometimes like a disappointed mentor. Never repeat the same style twice.
- The FINAL VERDICT must be crafted specifically around something unique in their profile — a repo name, a commit message, their follower count, their account age. Make it feel personal.

Format:

OVERALL RATING: [score/10 — one brutal line, style must vary each time based on the profile]

STRENGTHS:
• [one line — a real strength, reluctantly admitted]
• [one line — another real strength if it exists]

AREAS FOR IMPROVEMENT:
• [one line — specific callout with real data]
• [one line — specific callout with real data]
• [one line — specific callout with real data]
• [one line — specific callout with real data]

COMMIT MESSAGE ANALYSIS:
• [one line quoting or referencing their worst commit messages]
• [one line about their overall commit hygiene]

CAREER TRAJECTORY:
• [one darkly funny line about where they're headed]

ONE-LINERS:
• [savage burn about their commit messages]
• [savage burn about their repo names or count]
• [savage burn about their followers vs following ratio]
• [savage burn about their most embarrassing repo]
• [one line that summarizes their entire GitHub existence]

FINAL VERDICT: [One legendary line crafted specifically around something unique in their profile. The kind that gets screenshotted and haunts them forever.]`,
      },
      {
        role: "user",
        content: `Write the performance review for this developer:\n\n${dataStr}`,
      },
    ],
  });

  const text = completion.choices[0]?.message?.content;
  if (!text) throw new Error("No response from Groq");
  return text;
}
