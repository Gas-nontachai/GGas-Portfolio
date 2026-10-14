import { ArrowRight, Code2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'

const techStack = ['React', 'TypeScript', 'Node.js', 'REST API', 'SQL']

export default function MainClass() {
    const { t } = useTranslation()

    return (
        <section id="main-class" aria-labelledby="class-heading" className="portfolio-panel flex min-w-0 scroll-mt-[140px] flex-col justify-start gap-3 rounded-[8px] border-[3px] border-[#171717] bg-[#ffe16b] p-4 text-[#171717] shadow-[7px_7px_0_#171717]">
            <div className="m-0 flex items-center gap-3.5">
                <Code2 size={32} className="shrink-0" aria-hidden="true" />
                <h3 id="class-heading" className="m-0 text-[28px] leading-[1.12] font-bold">Full-Stack<br />Developer<span className="text-[#df563d]">.</span></h3>
            </div>
            <div id="tech-stack" className="grid gap-2">
                <a href="#tech-stack" className="m-0 flex items-center gap-2 border-0 bg-transparent p-0 text-left text-[13px] font-bold text-[#171717] underline underline-offset-4">{t('home.stack')}<ArrowRight size={19} aria-hidden="true" /></a>
                <ul className="m-0 flex list-none flex-wrap gap-2 p-0">{techStack.map((tech) => <li key={tech} className="rounded-[3px] border-[1.5px] border-[#171717] bg-[#fff6] px-2.5 py-[5px] text-[12px] font-bold">{tech}</li>)}</ul>
            </div>
        </section>
    )
}