import { Task, TASK_TYPE_LABEL, TASK_TYPE_ICON } from '@/lib/types'

export default function TaskCard({
  task,
  onStart,
}: {
  task: Task
  onStart: (task: Task) => void
}) {
  const pct = Math.min(100, (task.total_completed / task.total_needed) * 100)
  const isFull = task.total_completed >= task.total_needed

  return (
    <div className="bg-[#1A1D24] border border-[#2A2E38] rounded-2xl p-4 mb-3">
      <div className="flex justify-between items-start mb-2.5">
        <div className="flex gap-2.5 items-center">
          <div className="w-9 h-9 rounded-[10px] bg-[#00D9A3]/10 flex items-center justify-center text-base flex-shrink-0">
            {TASK_TYPE_ICON[task.task_type]}
          </div>
          <div>
            <div className="text-sm font-semibold line-clamp-1">{task.content_link}</div>
            <div className="text-xs text-[#8B8F99]">{TASK_TYPE_LABEL[task.task_type]} টাস্ক</div>
          </div>
        </div>
        <div className="bg-[#FFB020]/10 text-[#FFB020] text-[13px] font-bold px-2.5 py-1 rounded-lg whitespace-nowrap">
          +{task.points_per_action}
        </div>
      </div>

      <div className="w-full h-[5px] bg-[#2A2E38] rounded-full overflow-hidden mt-2.5">
        <div
          className="h-full bg-gradient-to-r from-[#00D9A3] to-[#00B589] rounded-full transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="flex justify-between text-[11px] text-[#8B8F99] mt-1.5">
        <span>{task.total_completed}/{task.total_needed} সম্পন্ন</span>
      </div>

      <button
        onClick={() => onStart(task)}
        disabled={isFull}
        className="w-full mt-3 bg-[#00D9A3] disabled:bg-[#2A2E38] disabled:text-[#8B8F99] text-[#04261D] font-semibold text-sm py-2.5 rounded-[10px]"
      >
        {isFull ? 'সম্পন্ন হয়েছে' : 'টাস্ক শুরু করুন'}
      </button>
    </div>
  )
}
