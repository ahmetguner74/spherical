import { Container } from "@/components/ui";
import { GitHubIcon } from "@/components/ui/Icons";
import { siteConfig } from "@/config/site";
import { VersionBadge } from "./VersionBadge";

export function Footer() {
  return (
    <footer className="border-t border-[var(--border)] bg-[var(--background)] py-6">
      <Container>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <p className="text-xs text-[var(--muted-foreground)]">
              &copy; {new Date().getFullYear()} {siteConfig.author.name}
            </p>
            <VersionBadge />
          </div>

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
