import { Container } from "@/components/ui";
import { GitHubIcon } from "@/components/ui/Icons";
import { siteConfig } from "@/config/site";

export function Footer() {
  return (
    <footer className="border-t border-[var(--border)] bg-[var(--background)] py-6">
      <Container>
        <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
          <p className="text-xs text-[var(--muted-foreground)]">
            &copy; {new Date().getFullYear()} {siteConfig.author.name}
          </p>

          <a
            href={siteConfig.author.github}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-[var(--muted-foreground)] transition-colors hover:text-[var(--foreground)]"
          >
            <GitHubIcon className="h-4 w-4" />
            <span>GitHub</span>
          </a>
        </div>
      </Container>
    </footer>
  );
}
