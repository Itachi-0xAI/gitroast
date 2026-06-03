const BASE = "https://api.github.com";

const headers = () => {
  const token = process.env.GITHUB_TOKEN;
  const base: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  if (token && token !== "your_github_token_here") {
    base["Authorization"] = `Bearer ${token}`;
  }
  return base;
};

export async function getProfile(username: string) {
  const res = await fetch(`${BASE}/users/${username}`, { headers: headers() });
  if (!res.ok) throw new Error(`GitHub user not found: ${username}`);
  return res.json();
}

export async function getRepos(username: string) {
  const res = await fetch(
    `${BASE}/users/${username}/repos?sort=updated&per_page=30`,
    { headers: headers() }
  );
  if (!res.ok) throw new Error(`Failed to fetch repos (HTTP ${res.status})`);
  return res.json();
}

export async function getCommitMessages(username: string, repo: string) {
  const res = await fetch(
    `${BASE}/repos/${username}/${repo}/commits?per_page=10&author=${username}`,
    { headers: headers() }
  );
  if (!res.ok) return [];
  const data = await res.json();
  return data.map((c: { commit: { message: string } }) =>
    c.commit.message.split("\n")[0].trim()
  );
}

export async function buildRoastPayload(username: string) {
  const [profile, repos] = await Promise.all([
    getProfile(username),
    getRepos(username),
  ]);

  const topRepos = repos.slice(0, 8);
  const commitSamples: string[] = [];

  await Promise.all(
    topRepos.slice(0, 4).map(async (repo: { name: string }) => {
      const msgs = await getCommitMessages(username, repo.name);
      commitSamples.push(...msgs);
    })
  );

  const languages = [
    ...new Set(
      topRepos
        .map((r: { language: string | null }) => r.language)
        .filter(Boolean)
    ),
  ];

  const readmeQuality = topRepos.map((r: { name: string; description: string | null; homepage: string | null }) => ({
    repo: r.name,
    hasDescription: !!r.description,
    hasHomepage: !!r.homepage,
  }));

  const emptyRepos = topRepos.filter(
    (r: { size: number }) => r.size === 0
  ).length;
  const forkedRepos = topRepos.filter(
    (r: { fork: boolean }) => r.fork
  ).length;

  return {
    profile: {
      name: profile.name || username,
      username,
      bio: profile.bio,
      followers: profile.followers,
      following: profile.following,
      publicRepos: profile.public_repos,
      accountAge: Math.floor(
        (Date.now() - new Date(profile.created_at).getTime()) /
          (1000 * 60 * 60 * 24 * 365)
      ),
      company: profile.company,
      hireable: profile.hireable,
    },
    repos: {
      total: profile.public_repos,
      emptyCount: emptyRepos,
      forkedCount: forkedRepos,
      languages,
      topRepos: topRepos.map((r: { name: string; stargazers_count: number; forks_count: number; size: number }) => ({
        name: r.name,
        stars: r.stargazers_count,
        forks: r.forks_count,
        size: r.size,
      })),
      readmeQuality,
    },
    commits: commitSamples.slice(0, 20),
  };
}
