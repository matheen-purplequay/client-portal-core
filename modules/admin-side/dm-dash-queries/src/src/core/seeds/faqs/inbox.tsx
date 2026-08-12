import { useEffect, useState } from "react";
import type { FAQ } from "./faq-model";
import { Input } from "../../../shell/components/atoms/inputs";

export default function InboxFAQs() {
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredFAQs, setFilteredFAQs] = useState<FAQ[]>([]);
    const [faqs, setFaqs] = useState<FAQ[]>([]);

    useEffect(() => {
        setFaqs([
            {
                question: "What is the Query Inbox?",
                answer: "The Query Inbox is your central hub for managing all client queries. It displays a list of jobs along with their associated queries, allowing you to track, respond to, and resolve client inquiries efficiently."
            },
            {
                question: "How do I find queries for a specific client?",
                answer: "Use the Client filter in the toolbar at the top of the Jobs List. You can select one or multiple clients to see only their jobs and queries. You can also use the search bar to find specific jobs by name."
            },
            {
                question: "What do the different query statuses mean?",
                answer: "Queries move through different stages: Draft (being prepared, not yet submitted), Open (submitted and awaiting response), Responded (a response has been provided), Resolved (the query has been addressed), and Closed (query is complete and archived)."
            },
            {
                question: "How do I raise a new query?",
                answer: "First, click on a job from the Jobs List to open it. Then click the 'Raise Query' button. Fill in the query details including category, sub-category, criticality level, select who to send it to, and provide your query description. Click Submit when ready."
            },
            {
                question: "What do the criticality levels mean?",
                answer: "Criticality indicates the urgency of a query. Low - general inquiries with no urgency, Normal - standard priority items, Medium - important matters requiring timely attention, High - urgent issues that need immediate action."
            },
            {
                question: "What does the Aging filter show?",
                answer: "Aging shows how long queries have been open. Fresh (less than 5 days) - recently raised queries, Pending (5-10 days) - queries that need attention soon, Overdue (more than 10 days) - queries requiring immediate follow-up."
            },
            {
                question: "How do I view the details of a query?",
                answer: "From the Jobs List, click on any job row to open it in a new tab. You'll see all queries for that job. Click on a specific query to expand it and view full details including the conversation history and any attachments."
            },
            {
                question: "What is the Draft Queries section for?",
                answer: "Draft Queries shows all queries that are still being prepared and haven't been submitted yet. If your organization has an approval process, draft queries will wait here for reviewer approval before being sent to the client."
            },
            {
                question: "How does the query approval process work?",
                answer: "When you submit a query, it may first go to a reviewer for approval. Reviewers can approve the query (it becomes Open), request changes, or reject it. You can see rejected queries in the Rejected Queries section."
            },
            {
                question: "Can I work with multiple jobs at once?",
                answer: "Yes! You can open multiple jobs as tabs. Click on different jobs to add them as tabs. Hold the Shift key while clicking to add a tab without switching to it. Click the X on any tab to close it."
            },
            {
                question: "How do I filter jobs to show only those with queries?",
                answer: "Use the 'Show only jobs with queries' toggle in the toolbar. This will hide jobs that have no queries, making it easier to focus on work that needs attention."
            },
            {
                question: "How can I quickly see the status of all queries?",
                answer: "The status summary bar at the top shows the total count of queries broken down by status (Draft, Open, Responded, Resolved, Closed). Click on any status to filter the job list to show only jobs with queries in that status."
            }
        ])
    }, []);

    useEffect(() => {
        const filteredFaqs = faqs.filter(faq => {
          const combinedText = `${faq.question} ${faq.answer}`;
          return matchesQuery(combinedText, searchTerm); // or fuzzyIncludes
        });
        setFilteredFAQs(filteredFaqs);
      }, [searchTerm, faqs]);

    function matchesQuery(text: string, query: string): boolean {
        const queryWords = query.toLowerCase().split(/\s+/).filter(Boolean);
        const textLower = text.toLowerCase();
        return queryWords.every(word => textLower.includes(word));
    }

    // function levenshtein(a: string, b: string): number {
    //     const dp = Array.from({ length: a.length + 1 }, (_, i) =>
    //       Array(b.length + 1).fill(0)
    //     );
    //     for (let i = 0; i <= a.length; i++) dp[i][0] = i;
    //     for (let j = 0; j <= b.length; j++) dp[0][j] = j;
    //     for (let i = 1; i <= a.length; i++) {
    //       for (let j = 1; j <= b.length; j++) {
    //         if (a[i - 1] === b[j - 1]) dp[i][j] = dp[i - 1][j - 1];
    //         else dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    //       }
    //     }
    //     return dp[a.length][b.length];
    //   }
      
    //   function fuzzyIncludes(text: string, query: string): boolean {
    //     const textWords = text.toLowerCase().split(/\s+/);
    //     const qWords = query.toLowerCase().split(/\s+/);
    //     return qWords.every(q =>
    //       textWords.some(t => levenshtein(q, t) <= 2) // allow 2 typos
    //     );
    //   }
      
    
    return (
        <div className="space-y-2">
            <div className="sticky top-0 bg-white/50 backdrop-blur-sm p-2">
                <Input theme="simple" type="text" placeholder="Search FAQs" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
            <div className="space-y-4">
                {filteredFAQs.map((faq, index) => (
                    <div key={index} className="space-y-2 border-b border-slate-200 px-3 pb-2 rounded-sm flex flex-col justify-center">
                        <div className="font-medium cursor-pointer text-sm" onClick={() => setSelectedIndex(index)}>{faq.question}</div>
                        <div className={`${selectedIndex == index ? 'h-auto' : 'h-0 pointer-events-none'} smooth-animation transition-all overflow-hidden`}>
                            <p className={`bg-slate-100 rounded p-2 shadow-inner text-sm duration-100`}>{faq.answer}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}