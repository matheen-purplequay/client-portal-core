import { useEffect, useRef, useState } from 'react';
import type { OBSJobRowData, JobHeader, JobTitle, OBSDashboardFilter, StatusCount } from '../../../../../core/models/movement';
import ProgressPanel from '../../../../components/statistics-panel-home/panels/progress-panel';
import Toast from '../../../../../shell/components/collections/toast';
import { apiRoutes } from '../../../../../config/api-routes';
import { DashboardTable } from '../../../../components/collections/dashboard-table';
import { useAppContext } from '../../../../../core/utils/stores/AppContext';
import { JobDetails } from '../../details/job-details/job-details';
import { JobTabBar } from '../components/job-tab-bar';
import { useEngagementVerticalContext } from '../../../../../core/utils/stores/EngagementVerticalContext';
import { transformStatusCounts } from '../../../helpers/transform-status-counts';
import { verticals } from '../../../../../core/seeds/verticals';
import { decryptData } from '../../../../../core/utils/helpers/localStorage';
import { FilterSidebar } from '../components/sidebarfilters';
import { JobToolbar } from '../components/job-toolbar';
import { FilterSummary } from '../components/filter-summary';


const jobTitles: JobTitle[] = [
	{ key: 'jobInYetToStart', title: 'Job In Yet To Start' },
	{ key: 'wipProcessing', title: 'WIP Processing' },
	{ key: 'sentForQueries', title: 'Sent For Queries', className: 'bg-yellow-100' },
	{ key: 'queryRepliesReceivedYetToAttend', title: 'Query Replies Rcvd. Yet To Attend', className: 'bg-yellow-100' },
	{ key: 'wipQueryReplies', title: 'WIP Query Replies' },
	{ key: 'internalReview', title: 'Internal Review' },
	{ key: 'wipInternalReviewReplies', title: 'WIP Internal Review Replies' },
	{ key: 'sentForReview', title: 'Sent For Review', className: 'bg-yellow-100' },
	{ key: 'reviewRepliesReceivedYetToAttend', title: 'Review Replies Rcvd. Yet To Attend' },
	{ key: 'wipReviewReplies', title: 'WIP Review Replies' },
	{ key: 'sentForFinalReview', title: 'Sent For Final Review', className: 'bg-yellow-100' },
	{ key: 'jobCompleted', title: 'Job Completed', className: 'bg-green-100' },
	{ key: 'onHold', title: 'On Hold' },
	{ key: 'cancelled', title: 'Cancelled' },
];

// Last Saved Order
// 1. Job-In Yet To Start
// 2. WIP - Processing
// 3. Sent For Queries
// 4. Query Replies Received - Yet To Attend
// 5. WIP - Query Replies
// 6. Internal Review 
// 7. WIP - Internal Review Replies
// 8. Sent For Review
// 9. Review Replies Received - Yet To Attend
// 10. WIP - Review Replies
// 11. Sent For Final Review 
// 12. Job Completed
// 13. On Hold
// 14. Cancelled


// 14. Cancelled

export const OBSJobTable = () => {
	const [isRefreshing, setIsRefreshing] = useState(false);
	const [statusLookup, setStatusLookup] = useState<{ [key: string]: number }>({});
	const [isFilterOpen, setIsFilterOpen] = useState(false);
	const [obsJobs, setOBSJobs] = useState<OBSJobRowData[]>([]);
	const [originalOBSJobs, setOriginalOBSJobs] = useState<OBSJobRowData[]>([]);
	const [obsHeaders, setOBSHeaders] = useState<JobHeader[]>([]);
	const containerRef = useRef<HTMLDivElement>(null);
	const [maxTabs, setMaxTabs] = useState(5); // default fallback
	const [obsTabs, setOBSTabs] = useState<OBSJobRowData[]>([]);

	const [isRefreshed, setIsRefreshed] = useState(false);
	const [isExporting, setIsExporting] = useState(false);

	const [isShiftPressed, setIsShiftPressed] = useState(false);

	const [selectedOBSJob, setSelectedOBSJob] = useState<OBSJobRowData | null>(null);
	const jobAPI = `${apiRoutes.movement.getWithCounts}`;
	const downloadAPI = `${apiRoutes.movement.downloadWithCounts}`;

	const [filters, setFilters] = useState<OBSDashboardFilter>({ financial_year: "All", status_id: -1 });
	const [receivedFrom, setReceivedFrom] = useState<string[]>([]);
	const [accountant, setAccountant] = useState<string[]>([]);
	const [natureOfJobOptions, setNatureOfJobOptions] = useState<string[]>([]);
	const [selectedTitle, setSelectedTitle] = useState<JobTitle | null>({ id: -1, key: 'livejobs', title: 'Live Jobs', titleClass: '', valueClass: '', className: '' });

	const context = useAppContext();
	const engagementVertical = useEngagementVerticalContext();

	const [statusCount, setStatusCount] = useState<StatusCount[]>([]);

	const [isFirstTimeLoaded, setIsFirstTimeLoaded] = useState(false);


	useEffect(() => {
		if (engagementVertical.vertical && engagementVertical.vertical.wm_vertical_id === 1 && !isFirstTimeLoaded) {
			setIsFirstTimeLoaded(true);
			calculateMaxTabs();
			fetchOBSJobs();
		}

		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Shift") setIsShiftPressed(true);
		};
		const handleKeyUp = (e: KeyboardEvent) => {
			if (e.key === "Shift") setIsShiftPressed(false);
		};

		window.addEventListener("keydown", handleKeyDown);
		window.addEventListener("keyup", handleKeyUp);

		return () => {
			window.removeEventListener("keydown", handleKeyDown);
			window.removeEventListener("keyup", handleKeyUp);
		};
	}, [engagementVertical.vertical]);

	useEffect(() => {
		if (statusCount.length > 0) {
			const map: any = {};
			statusCount.forEach((item) => {
				map[item.key] = item.id;   // key = name | id = API StatusId
			});
			setStatusLookup(map);
		}
	}, [statusCount]);


	const handleOBSJobUnselected = (job: OBSJobRowData) => {
		calculateMaxTabs();
		if (obsTabs.length === 1) {
			setSelectedOBSJob(null);
			setOBSTabs([]);
		} else {
			// select nearest tab on right or left
			// if unselected job is selected tab switch to nrearest tab or else just remove the tab
			if (selectedOBSJob?.Aid === job.Aid) {
				const index = obsTabs.findIndex((tab) => tab.Aid === job.Aid);
				if (index > -1) {
					if (index === 0) {
						setSelectedOBSJob(obsTabs[index + 1]);
					} else {
						setSelectedOBSJob(obsTabs[index - 1]);
					}
				}
			}
			setOBSTabs(obsTabs.filter((tab) => tab.Aid !== job.Aid));
		}
	};

	const calculateMaxTabs = () => {
		if (containerRef.current) {
			const parentWidth = containerRef.current.offsetWidth;
			const fitTabs = Math.floor(parentWidth / 220); // 150px per tab
			setMaxTabs(fitTabs);
		}
	};

	useEffect(() => {
		const excludeHeaders = ["Aid", "StatusId", "NewWorkStatus"];
		if (obsJobs && obsJobs.length > 0) {
			const headers = Object.keys(obsJobs[0]);
			setOBSHeaders(
				headers
					.filter((header) => !excludeHeaders.includes(header))
					.map((header) => ({ id: header, label: header }))
			);
		}
	}, [obsJobs]);

	const getFilters = () => {
		let params: any = {};
		if (filters.status_id !== 0 && filters.status_id !== undefined) {
			params.status_id = filters.status_id;
		}
		if (filters.financial_year && filters.financial_year !== "All") {
			params.financial_year = filters.financial_year;
		}
		if (filters.received_from !== 'All' && filters.received_from !== undefined) {
			params.received_from = filters.received_from;
		}
		if (filters.accountant !== 'All' && filters.accountant !== undefined) {
			params.accountant = filters.accountant;
		}
		if (filters.nature_of_job !== 'All' && filters.nature_of_job !== undefined) {
			params.nature_of_job = filters.nature_of_job;
		}
		if (filters.received_date_range) {
			params.received_date_range = filters.received_date_range;
		}
		if (filters.commenced_date_range) {
			params.commenced_date_range = filters.commenced_date_range;
		}
		return params;
	};


	const getFilterswith = (customFilter: any) => {
		let params: any = {};
		if (customFilter.status_id !== 0 && customFilter.status_id !== undefined) {
			params.status_id = customFilter.status_id;
		}
		if (customFilter.financial_year && customFilter.financial_year !== "All") {
			params.financial_year = customFilter.financial_year;
		}
		if (customFilter.received_from !== 'All' && customFilter.received_from !== undefined) {
			params.received_from = customFilter.received_from;
		}
		if (customFilter.accountant !== 'All' && customFilter.accountant !== undefined) {
			params.accountant = customFilter.accountant;
		}
		if (customFilter.nature_of_job !== 'All' && customFilter.nature_of_job !== undefined) {
			params.nature_of_job = customFilter.nature_of_job;
		}
		if (customFilter.received_date_range) {
			params.received_date_range = customFilter.received_date_range;
		}
		if (customFilter.commenced_date_range) {
			params.commenced_date_range = customFilter.commenced_date_range;
		}
		return params;
	};

	const fetchOBSJobs = async () => {
		setOBSJobs([]);
		setIsRefreshing(true);
		if(isRefreshing) return;

		try {
			const response = await fetch(jobAPI, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					service_id: verticals.obs,
					project_id: context?.userData?.project_id,
					user_id: JSON.parse(decryptData(localStorage.getItem('wm_user')))?.wm_client_id ?? JSON.parse(decryptData(localStorage.getItem('userdata')))?.client_id ?? 0,
					filters: JSON.stringify(getFilters()),
				}),
			});

			if (!response.ok) {
				throw new Error("Network response was not ok");
			}

			const data = await response.json();
			if(data.data && data.data.length > 0) {
				setOBSJobs(data.data);
				if (originalOBSJobs.length <= 0) setOriginalOBSJobs(data.data);
			} else {
				setOBSJobs([]);
				setOriginalOBSJobs([]);
			}
			if (Array.isArray(data.counts)) {
				setStatusCount(transformStatusCounts(data.counts, jobTitles));
			}
			setIsRefreshed(true);
		} catch (error) {
			console.log("Error fetching jobs:", error);
		} finally {
			setIsRefreshing(false);
		}
	};

	const fetchOBSJobsWith = async (customFilter: any) => {
		if(isRefreshing) return;

		try {
			setOBSJobs([]);
			setIsRefreshing(true);

			const response = await fetch(jobAPI, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					service_id: verticals.obs,
					project_id: context?.userData?.project_id,
					user_id: JSON.parse(decryptData(localStorage.getItem('wm_user')))?.wm_client_id ?? JSON.parse(decryptData(localStorage.getItem('userdata')))?.client_id ?? 0,
					filters: JSON.stringify(getFilterswith(customFilter)),
				}),
			});

			const data = await response.json();
			setOBSJobs(data.data ?? []);
			if (Array.isArray(data.counts)) {
				setStatusCount(transformStatusCounts(data.counts, jobTitles));
			}
		} catch (e) {
			console.log("Error fetching jobs with filter:", e);
		} finally {
			setIsRefreshing(false);
		}
	};


	const downloadOBSJobs = async () => {
		setIsExporting(true);

		try {
			const res = await fetch(downloadAPI, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					service_id: verticals.obs,
					project_id: context?.userData?.project_id,
					user_id: JSON.parse(decryptData(localStorage.getItem('wm_user')))?.wm_client_id ?? JSON.parse(decryptData(localStorage.getItem('userdata')))?.client_id ?? 0,
					filters: JSON.stringify(getFilters()),
				}),
			});

			if (!res.ok) {
				// try to read error as JSON for nice message
				const maybeJson = await res.text();
				try {
					const err = JSON.parse(maybeJson);
					throw new Error(err?.message || "Download failed");
				} catch {
					throw new Error("Download failed");
				}
			}

			// It's a file → get blob
			const blob = await res.blob();

			// optional: filename from header
			const cd = res.headers.get("content-disposition");
			const match = cd?.match(/filename="?([^"]+)"?/i);
			const filename = match?.[1] || "Job_Movement_Export.xlsx";

			// trigger download
			const url = window.URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.href = url;
			a.download = filename;
			document.body.appendChild(a);
			a.click();
			a.remove();
			window.URL.revokeObjectURL(url);

			setIsExporting(false);
		} catch (err) {
			console.log("Download error:", err);
			setIsExporting(false);
		}
	};

	const switchJobTab = (job: OBSJobRowData) => {
		setSelectedOBSJob(job);
	};

	const handleJobSelected = (job: OBSJobRowData) => {
		calculateMaxTabs();
		if (obsTabs.length >= maxTabs) return;

		if (!obsTabs.some(tab => tab.Aid === job.Aid)) {
			setOBSTabs([...obsTabs, job]);
		}

		//Check if user is pressed shift key
		if (!isShiftPressed) {
			setSelectedOBSJob(job);
		}
	};

	const handleJobFilterByTitle = (jobTitle: JobTitle | null) => {
		if (jobTitle && jobTitle.id) {
			const newFilters = { ...filters, status_id: jobTitle.id };
			setFilters(newFilters);
			setSelectedTitle(jobTitle);
			fetchOBSJobsWith(newFilters);
		} else {
			const newFilters = { ...filters, status_id: -1 };
			setFilters(newFilters);
			setSelectedTitle({ id: -1, key: 'livejobs', title: 'Live Jobs', titleClass: '', valueClass: '', className: '' });
			fetchOBSJobsWith(newFilters);
		}
	};

	const handleRemoveFilter = (key: string) => {
		const newFilters = { ...filters };
		if (key === 'status_id') {
			newFilters.status_id = -1;
		} else if (key === 'financial_year') {
			newFilters.financial_year = "All";
		} else if (key === 'received_from') {
			newFilters.received_from = 'All';
		} else if (key === 'accountant') {
			newFilters.accountant = 'All';
		} else if (key === 'nature_of_job') {
			newFilters.nature_of_job = 'All';
		} else if (key === 'received_date_range') {
			newFilters.received_date_range = undefined;
		} else if (key === 'commenced_date_range') {
			newFilters.commenced_date_range = undefined;
		}

		setFilters(newFilters);
		fetchOBSJobsWith(newFilters);
	};




	useEffect(() => {
		const timer = setTimeout(() => setIsRefreshed(false), 3000);
		return () => clearTimeout(timer);
	}, [isRefreshed]);

	useEffect(() => {
		if (originalOBSJobs && originalOBSJobs.length > 0) {

			const receivedFrom = originalOBSJobs
				.map(job => job.ReceivedFrom)
				.filter((value, index, self) => self.indexOf(value) === index);

			setReceivedFrom(['All', ...receivedFrom]);

			const accountant = originalOBSJobs
				.map(job => job.Accountant)
				.filter((value, index, self) => self.indexOf(value) === index);

			setAccountant(['All', ...accountant]);

			const natureOfJobOptions = originalOBSJobs
				.map(job => job.Naturejob)
				.filter((value, index, self) => value && self.indexOf(value) === index);

			setNatureOfJobOptions(['All', ...natureOfJobOptions]);

			// FIXED: use functional updates to avoid stale state issue
			setFilters(prev => ({
				...prev,
				received_from: prev.received_from ?? 'All',
				accountant: prev.accountant ?? 'All',
				nature_of_job: prev.nature_of_job ?? 'All',
			}));
		}
	}, [originalOBSJobs]);


	return (
		<div className="w-full">
			<div className="space-y-6">
				<ProgressPanel statusCount={statusCount} selectedTitle={selectedTitle} setSelectedTitle={handleJobFilterByTitle} isRefreshing={isRefreshing} containerClassName={`${isRefreshing && 'opacity-50 pointer-events-none'}`} hideIfNoValue={true} />

				<div className="flex flex-col gap-4 space-y-4">
					<div className="flex-1">
						<JobTabBar tabs={obsTabs} selectedTab={selectedOBSJob} vertical={engagementVertical.vertical?.title || ""} onTabSelect={switchJobTab} onTabClose={handleOBSJobUnselected} containerRef={containerRef} />
						<div className="z-10 relative">
							<div className={`${selectedOBSJob === null ? "block" : "hidden"}`}>
								<DashboardTable
									rows={obsJobs}
									headers={obsHeaders}
									jobSelected={handleJobSelected}
									isRefreshing={isRefreshing}
									toolbarContent={
										<div className="flex items-center">
											<FilterSummary 
												filters={filters} 
												jobTitles={jobTitles} 
												statusLookup={statusLookup} 
												onRemove={handleRemoveFilter}
												onValueClick={() => setIsFilterOpen(true)}
											/>
											<JobToolbar
												isRefreshing={isRefreshing}
												refreshRecords={() => {
													fetchOBSJobs();
												}}
												setIsFilterOpen={setIsFilterOpen}
												isExporting={isExporting}
												downloadJobs={() => {
													downloadOBSJobs();
												}}
												disabled={obsJobs.length <= 0}
											/>
										</div>
									}
								/>
							</div>
							{obsTabs && obsTabs.length > 0 && obsTabs.map((tab) => (
								<div key={tab.Aid} className={`pb-5 ${selectedOBSJob?.Aid === tab.Aid ? "block" : "hidden"}`}>
									<JobDetails job={tab} jobUnselected={handleOBSJobUnselected} />
								</div>
							))}
						</div>
					</div>
				</div>

				<Toast message="Jobs Refreshed" show={isRefreshed} setShow={setIsRefreshed} />
			</div>
			<FilterSidebar
				isOpen={isFilterOpen}
				onClose={() => setIsFilterOpen(false)}
				filters={filters}
				setFilters={setFilters}
				receivedFrom={receivedFrom}
				accountant={accountant}
				natureOfJobOptions={natureOfJobOptions}
				jobTitles={jobTitles}
				statusLookup={statusLookup}
				onApply={(appliedFilters) => {
					setFilters(appliedFilters);   // update state
					fetchOBSJobsWith(appliedFilters);               // fetch immediately
				}}
			/>
		</div>
	);
};