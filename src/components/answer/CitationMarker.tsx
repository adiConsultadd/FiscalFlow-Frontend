import { useQueryStore } from '../../store/queryStore';

interface CitationMarkerProps {
    evidenceId: number;
}

export function CitationMarker({ evidenceId }: CitationMarkerProps) {
    const { activeCitationId, setActiveCitation } = useQueryStore();
    const isActive = activeCitationId === evidenceId;

    const handleClick = () => {
        setActiveCitation(isActive ? null : evidenceId);

        // Scroll to source card
        const sourceElement = document.getElementById(`source-${evidenceId}`);
        if (sourceElement) {
            sourceElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    };

    return (
        <button
            onClick={handleClick}
            className={`citation-marker ${isActive ? 'active' : ''}`}
            title={`View Evidence ${evidenceId}`}
        >
            Evidence {evidenceId}
        </button>
    );
}

// Function to parse answer text and replace citation markers with interactive components
export function parseCitations(text: string): (string | { type: 'citation'; id: number })[] {
    const parts: (string | { type: 'citation'; id: number })[] = [];
    const regex = /\[Evidence\s+(\d+)\]/gi;
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(text)) !== null) {
        // Add text before the match
        if (match.index > lastIndex) {
            parts.push(text.slice(lastIndex, match.index));
        }
        // Add citation marker
        parts.push({ type: 'citation', id: parseInt(match[1], 10) });
        lastIndex = regex.lastIndex;
    }

    // Add remaining text
    if (lastIndex < text.length) {
        parts.push(text.slice(lastIndex));
    }

    return parts;
}
