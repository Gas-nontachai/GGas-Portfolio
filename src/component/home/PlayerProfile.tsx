import ProfileOrbit from '../profile/ProfileOrbit'

export default function PlayerProfile() {
  return (
    <section id="profile" aria-labelledby="profile-heading" className="portfolio-panel relative z-10 row-span-2 flex min-w-0 scroll-mt-[140px] items-stretch rounded-[8px] border-0 shadow-none has-[[data-dragging=true]]:z-[60] has-[[data-recovering=true]]:z-[60] [&_.profile-orbit]:flex [&_.profile-orbit]:max-w-none [&_.profile-orbit]:items-stretch [&_.profile-orbit]:p-0 [&_[data-profile-card]]:flex [&_[data-profile-card]]:w-full [&_[data-profile-card]_article]:flex [&_[data-profile-card]_article]:max-w-none [&_[data-profile-card]_article>div]:aspect-auto [&_[data-profile-card]_article>div]:min-h-[520px] [&_[data-profile-card]_article>div]:w-full max-[1150px]:row-auto max-[1150px]:[&_[data-profile-card]_article>div]:min-h-[480px] max-[700px]:order-first max-[700px]:[&_[data-profile-card]_article>div]:min-h-[440px]">
      <h2 id="profile-heading" className="sr-only">Player Profile</h2>
      <ProfileOrbit />
    </section>
  )
}