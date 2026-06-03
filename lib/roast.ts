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
- MAX 12 WORDS PER BULLET. No exceptions. If it's longer than 12 words, cut it.
- Every bullet must be a complete thought in under 12 words. Short. Sharp. Done.
- Write like a comedian, not an HR manager. Wit > cruelty.
- Quote actual commit messages and repo names directly — no paraphrasing.
- NEVER use questions. Statements only.
- NEVER say "secret agent", "just lazy", "hiding something", "lack of creativity", "lack of attention".
- NEVER use corporate phrases like "a dismal display of", "indicative of", "a testament to", "a reflection of".
- Make the reader laugh first, then wince. That's the formula.
- Every line must be unique to this specific developer's data. Nothing generic.
- The OVERALL RATING line: one unexpected metaphor or comparison, max 15 words.
- ONE-LINERS must be actual one-liners — punchy, unexpected, under 12 words each.
- FINAL VERDICT: one line, references something specific from their profile, makes you want to screenshot it.

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
