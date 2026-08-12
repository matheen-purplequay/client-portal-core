import type { OBSJobRowData } from "../../../../../core/models/movement";
import { SimpleDialog } from "../../../../../shell/components/dialogs/dialog";


export function JobDialog(props: {
    job: OBSJobRowData | null;
    selectedValue: string;
    onClose: (value: string) => void;
}) {
    const { onClose, selectedValue } = props;

    const handleClose = () => {
        onClose(selectedValue);
    };

    return (
        <SimpleDialog title={props.job ? <div className="font-medium">{props.job.Jobname}</div> : "Job Details"}
            onClose={handleClose} dialogSize="xl"
        >
            <div className='border rounded bg-slate-50 border-slate-300 p-3'>
                {props.job ? (
                    <div>
                        <p>Job Description: {props.job.Partner}</p>
                    </div>
                ) : (
                    <p>No job selected</p>
                )}
            </div>
        </SimpleDialog>
    );
}