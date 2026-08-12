import { useEffect, useState } from "react";
import { apiRoutes } from "../../../../../config/api-routes";
import { Input } from "../../../../../shell/components/atoms/inputs";
import { Button } from "../../../../../shell/components/atoms/buttons";
import type { Instruction, CommentCode } from "../../../../../core/models/instruction";
import { useAppContext } from "../../../../../core/utils/stores/AppContext";
import { AlertCircle, CircleUserRound, Loader, MessageSquarePlus, MessageSquareText, NotebookText, Trash } from "lucide-react";
import { decryptData } from "../../../../../core/utils/helpers/localStorage";

interface InstructionsProps<T extends Record<string, any>> {
    job: T;
    width?: "default" | "full";
}

interface DetailTab {
    id: string;
    label: string;
    icon: any;
}

interface JobNote {
    id: string;
    note: string;
    created_at: string;
}

const detailTabs: DetailTab[] = [
    { id: 'instructions', label: 'Instructions', icon: <MessageSquareText /> },
    { id: 'notes', label: 'Notes', icon: <NotebookText /> }, 
    { id: 'participants', label: 'Participants', icon: <CircleUserRound /> },
];

export const Instructions = <T extends Record<string, any>>({ job, width = "default" }: InstructionsProps<T>) => {
    const context = useAppContext();
    const userData = context?.userData;
    const [instructions, setInstructions] = useState<Instruction[]>([]);
    const [participants, setParticipants] = useState<string[]>([]);
    const [currentInstruction, setCurrentInstruction] = useState('');
    const [commentCodes, setCommentCodes] = useState<CommentCode[]>([]);
    const [activeDetailsTab, setActiveDetailsTab] = useState<DetailTab['id']>('instructions');
    const [note, setNote] = useState('');
    const [notes, setNotes] = useState<JobNote[]>([]);
    const [isSavingNote, setIsSavingNote] = useState(false);
    const [isDeletingNote, setIsDeletingNote] = useState(false);
    const [userId, setUserId] = useState<number>(0);

    useEffect(() => {
        const user_id = JSON.parse(decryptData(localStorage.getItem('wm_user')))?.wm_client_id ?? JSON.parse(decryptData(localStorage.getItem('userdata')))?.client_id ?? 0;
        setUserId(user_id);
    }, []);

    const fetchInstructions = async () => {
        const response = await fetch(apiRoutes.instructions.get, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                job_id: job.Aid,
            }),
        });
        const data = await response.json();
        setInstructions(data.data);
        console.log(data);
    }

    useEffect(() => {
        getParticipants();
    }, [instructions]);

    const getParticipants = () => {
        const uniqueParticipants = Array.from(
            new Set(instructions.map((instruction) => instruction.username))
        );
        setParticipants(uniqueParticipants);
    };


    // const sendInstruction = async () => {
    //     const response = await fetch(apiRoutes.instructions.send, {
    //         method: 'POST',
    //         headers: {
    //             'Content-Type': 'application/json',
    //         },
    //         body: JSON.stringify({
    //             job_id: job.Aid,
    //             instruction: currentInstruction,
    //         }),
    //     });
    //     const data = await response.json();
    //     setCurrentInstruction('');
    //     fetchInstructions();
    // }

    const insertInstruction = async () => {
        const requestObject = {
            job_id: job.Aid,
            user_id: JSON.parse(decryptData(localStorage.getItem('wm_user')))?.wm_client_id ?? JSON.parse(decryptData(localStorage.getItem('userdata')))?.client_id ?? 0,
            client_id: userData?.project_id,
            comment_type: 1,
            comments: currentInstruction,
            comment_code: 1,
            code: 1,
        };
        console.log('request object ', requestObject);
        await fetch(apiRoutes.instructions.insert, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestObject),
        });
        setCurrentInstruction('');
        fetchInstructions();
    };

    const getCommentCodes = async () => {
        const response = await fetch(apiRoutes.instructions.commentCodes, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        const data = await response.json();
        setCommentCodes(data.data);
    };

    const getNotes = async () => {
        const response = await fetch(apiRoutes.notes.get, {
            method: 'POST',
            body: JSON.stringify({
                job_id: job.Aid,
                client_id: userData?.project_id,
                user_id: JSON.parse(decryptData(localStorage.getItem('wm_user')))?.wm_client_id ?? JSON.parse(decryptData(localStorage.getItem('userdata')))?.client_id ?? 0
            }),
            headers: {
                'Content-Type': 'application/json',
            },
        });
        const data = await response.json();
        console.log('notes data ', data);
        setNotes([...data.data]);
    };

    const saveNote = async () => {
        if(!note) return;
        if(note.length > 3000) {
            alert('Note should be less than 3000 characters');
            return;
        }
        if(userId == 0) {
            return;
        }
        setIsSavingNote(true);
        // TODO: Implement save note logic
        const response = await fetch(apiRoutes.notes.upsert, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                job_id: job.Aid,
                client_id: userData?.project_id,
                user_id: userId,
                note: note
            }),
        });
        const data = await response.json().catch((err: any) => {
            if(err) alert('Something went wrong while saving the note');
            return null;
        });
        if(data) {
            getNotes();
            setNote('');
        }
        setIsSavingNote(false);
    }

    const deleteNote = async (noteId: string) => {
        if(!noteId) return;
        if(!confirm('Are you sure you want to delete this note?')) return;

        setIsDeletingNote(true);

        const response = await fetch(apiRoutes.notes.delete, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                note_id: noteId,
                client_id: userData?.project_id,
                user_id: userId,
                job_id: job.Aid
            }),
        });
        const data = await response.json().catch((err: any) => {
            if(err) alert('Something went wrong while deleting the note');
            return null;
        });
        if(data) {
            getNotes();
        }
        setIsDeletingNote(false);
    }

    useEffect(() => {
        fetchInstructions();
        getCommentCodes();
        getNotes();
    }, []);

    return (
        <div className={`mx-auto ${width !== 'full' ? 'lg:max-w-[800px] md:max-w-[600px] p-4' : 'w-auto'}`}>
            <div className="flex items-stretch justify-start gap-0 text-xs border border-slate-300 rounded-lg overflow-hidden">

                {/* Instructions */}
                <div className="pt-[1px] flex-1 overflow-hidden flex flex-col bg-slate-100 shadow-inner w-full rounded-t-lg">
                    <div className="pl-2 pr-4 bg-slate-50 border-b border-slate-300 text-sm flex items-center gap-2 justify-between w-full flex-1">
                        <Button theme="simple_primary" className="flex gap-1 items-center pl-1 pr-2 whitespace-nowrap" onClick={() => {
                            setCurrentInstruction(commentCodes[1].title);
                        }}>
                            <AlertCircle strokeWidth={1.5} /> Request to mark as priority
                        </Button>

                        <nav className="flex gap-x-1" aria-label="Tabs" role="tablist" aria-orientation="horizontal">
                            {detailTabs.map((tab) => (
                                <button type="button"
                                    className={`
                                        pt-3 pb-2 font-bold px-4 flex items-center gap-x-2 outline-0 cursor-pointer border-b-2
                                        ${tab.id === activeDetailsTab ? 'text-primary border-primary' : 'border-slate-300 text-slate-700'}
                                    `}
                                    onClick={() => setActiveDetailsTab(tab.id)}
                                    aria-selected="true" data-hs-tab="#segment-1" aria-controls="segment-1" role="tab">
                                    <div>{tab.icon}</div>
                                    <div className={`${tab.id === activeDetailsTab ? 'w-auto' : 'w-0'} smooth-animation transition-all duration-300 overflow-hidden`}>{tab.label}</div>
                                </button>
                            ))}
                        </nav>
                    </div>
                    <div className="grid grid-cols-2">
                        <div className="flex flex-col flex-1 w-full">
                            <div
                                className="
                                    pe-3 pl-2 h-[450px] overflow-y-auto [&::-webkit-scrollbar]:w-2
                                    [&::-webkit-scrollbar-track]:bg-gray-100
                                    [&::-webkit-scrollbar-thumb]:bg-gray-300
                                    [&::-webkit-scrollbar-thumb]:rounded-full
                                    dark:[&::-webkit-scrollbar-track]:bg-neutral-700
                                    dark:[&::-webkit-scrollbar-thumb]:bg-neutral-500
                                "
                            >
                                {instructions.length <= 0 && <div className="text-slate-500 text-sm text-center">
                                    <div className="p-2">
                                        <p>No instructions found</p>
                                        <p>Send new instruction to begin</p>
                                    </div>
                                </div>}
                                {instructions.length > 0 && instructions.map((instruction, index) => (
                                    <div key={index} className="py-1">
                                        <div className={`flex items-start ${instruction.UserId === userData?.user_id ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`py-3 max-w-xs flex items-start gap-2 ${instruction.UserId === userData?.user_id ? 'flex-row-reverse' : 'flex-row'}`}>
                                                {/* <img src={defaultProfilePicture} className={`rounded-full mt-1 ${instruction.UserId === userData?.user_id ? 'ml-2' : 'mr-2'}`} alt="profile picture" style={{ width: '32px', height: '32px' }} /> */}
                                                <div className="flex items-start bg-white rounded-full shadow-sm">
                                                    <svg xmlns="http://www.w3.org/2000/svg" 
                                                        className={`lucide lucide-circle-user-round-icon lucide-circle-user-round opacity-50`}
                                                        style={{ width: '32px', height: '32px' }}
                                                        viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                                                            <path d="M18 20a6 6 0 0 0-12 0"/>
                                                            <circle cx="12" cy="10" r="4"/>
                                                            <circle cx="12" cy="12" r="10"/>
                                                    </svg>
                                                </div>
                                                <div className="flex flex-col gap-1">
                                                    <p className="text-xs font-semibold text-slate-700">{instruction.username}</p>
                                                    <div className="bg-white rounded-lg shadow p-2 px-4">
                                                        <p className="text-sm text-slate-700">{instruction.Comments}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="p-2 bg-white flex gap-2 items-stretch w-full border-t border-slate-300">
                                <Input
                                    containerClassName="flex-1 w-full"
                                    className="bg-transparent border-0 shadow-nner"
                                    inputStyle="rounded"
                                    value={currentInstruction}
                                    onChange={(e) => setCurrentInstruction(e.target.value)}
                                    placeholder="Add instruction"
                                    dataList={commentCodes.map((commentCode) => commentCode.title)}
                                />
                                <Button theme="simple_primary" className={`bg-slate-100 ${currentInstruction.length <= 0 ? 'opacity-50 pointer-events-none' : ''}`} shape="pill" onClick={insertInstruction}>Send</Button>
                            </div>
                        </div>
                        {/* Instruction Sidebar */}
                        <div className="bg-stone-100 flex flex-col flex-1 px-1 border-l border-slate-300 overflow-y-auto max-h-[500px]">
                            <div className="px-1 py-2 flex-1">
                                {activeDetailsTab === 'participants' &&
                                    <ul className="space-y-2">
                                        {participants && participants.length > 0 && participants.map((participant, index) => (
                                            <li key={index} className="py-1 text-left text-sm text-slate-700 flex items-center gap-2">
                                                <CircleUserRound />
                                                {participant}
                                            </li>
                                        ))}
                                        {!participants || participants.length <= 0 && <p className="text-slate-700 p-5 text-center">No participants found</p>}
                                    </ul>
                                }
                                {activeDetailsTab === 'instructions' && 
                                    <div className="p-2 space-y-4">
                                        <div>
                                            <div className="text-sm text-slate-500 font-semibold">Standard Instructions</div>
                                            <div className="text-xs text-slate-500">Select an instruction to include it in the instruction field.</div>
                                        </div>
                                        <ul className="space-y-4">
                                            {commentCodes && commentCodes.length > 0 && commentCodes.map((commentCode, index) => (
                                                <li key={index} 
                                                    className="py-1 text-left text-sm bg-white text-slate-700 rounded shadow-sm px-3 cursor-pointer flex items-start gap-2"
                                                    onClick={() => setCurrentInstruction(commentCode.title)}
                                                >
                                                    <div className="mt-1"><MessageSquarePlus size={14} /></div>
                                                    <div className="flex-1">{commentCode.title}</div>
                                                </li>
                                            ))}
                                            {!commentCodes || commentCodes.length <= 0 && <p className="text-slate-700 p-5 text-center">No standard instructions found</p>}
                                        </ul>
                                    </div>
                                }
                                {activeDetailsTab === 'notes' &&
                                    <>
                                        <div className="flex flex-col items-end border border-slate-300 rounded-lg bg-white shadow-inner">
                                            <textarea rows={5} className="outline-0 w-full p-2" placeholder="Add instruction notes here..." value={note} onChange={(e) => setNote(e.target.value)}></textarea>
                                            <div className={`p-1 border-t border-slate-300 flex-1 w-full flex justify-end ${userId == 0 && 'opacity-50 pointer-events-none'}`}>
                                                {isSavingNote ? <Loader size={20} className="animate-spin" /> : <Button theme="light" onClick={saveNote}>Save Note</Button>}
                                            </div>
                                        </div>

                                        <div className="py-3 space-y-3">
                                            {notes && notes.length > 0 && notes.map((note, index) => (
                                                <div key={index} className="p-2 bg-white text-slate-700 rounded shadow-sm">
                                                    <div>{note.note}</div>
                                                    <div className="text-xs text-slate-500 flex items-center justify-between">
                                                        {note.created_at ? new Date(note.created_at).toLocaleString() : ''}
                                                        <Button theme="simple" className="px-1" onClick={() => deleteNote(note.id)}>
                                                            {isDeletingNote ? <Loader size={14} className="animate-spin" /> : <Trash size={14} />}
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </>
                                }
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};