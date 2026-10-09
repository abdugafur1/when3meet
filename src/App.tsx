import { useEffect, useState } from 'react';
import type { FormEvent, PointerEvent } from 'react';
import './App.css';
import {
  createMeeting,
  listenToMeeting,
  listenToUserDashboard,
  saveAvailability,
  saveUsualSchedule,
  type Meeting,
  type UserDashboard,
} from './services/meetingService';
import {
  listenToAuth,
  register,
  signIn,
  signOut,
  type AppUser,
} from './services/authService';

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const hours = Array.from({ length: 16 }, (_, index) => index + 7);

const formatHour = (hour: number) => {
  const suffix = hour < 12 ? 'AM' : 'PM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:00 ${suffix}`;
};

const App = () => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [dashboard, setDashboard] = useState<UserDashboard>({ meetings: {}, savedSlots: [] });
  const [usualSlots, setUsualSlots] = useState<string[]>([]);
  const [meetingId, setMeetingId] = useState(
    () => new URLSearchParams(window.location.search).get('meeting'),
  );
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
  const [hoveredSlot, setHoveredSlot] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [title, setTitle] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [drawMode, setDrawMode] = useState<boolean | null>(null);
  const [usualDrawMode, setUsualDrawMode] = useState<boolean | null>(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => listenToAuth((nextUser) => {
    setUser(nextUser);
    setAuthReady(true);
    setMeeting(null);
    setDashboard({ meetings: {}, savedSlots: [] });
    setUsualSlots([]);
    setSelectedSlots([]);
    setHoveredSlot(null);
    setName('');
  }), []);

  useEffect(() => {
    const handlePopState = () => {
      setMeeting(null);
      setSelectedSlots([]);
      setHoveredSlot(null);
      setMeetingId(new URLSearchParams(window.location.search).get('meeting'));
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    if (!user) return;
    let savedSlots: string[] = [];
    let activeMeeting: Meeting | null = null;
    const stopDashboard = listenToUserDashboard(user.uid, (nextDashboard) => {
      savedSlots = nextDashboard.savedSlots;
      setDashboard(nextDashboard);
      setUsualSlots(nextDashboard.savedSlots);
      if (activeMeeting && !activeMeeting.responses[user.uid]) {
        setSelectedSlots(nextDashboard.savedSlots);
      }
    }, (message) => setError(message));
    const stopMeeting = meetingId ? listenToMeeting(
      meetingId,
      (nextMeeting) => {
        activeMeeting = nextMeeting;
        setMeeting(nextMeeting);
        if (nextMeeting) {
          const response = nextMeeting.responses[user.uid];
          setSelectedSlots(response ? Object.keys(response.slots) : savedSlots);
        }
      },
      (message) => setError(message),
    ) : undefined;
    return () => {
      stopDashboard();
      stopMeeting?.();
      activeMeeting = null;
    };
  }, [meetingId, user]);

  const navigateToMeeting = (id: string | null) => {
    const url = new URL(window.location.href);
    if (id) url.searchParams.set('meeting', id);
    else url.searchParams.delete('meeting');
    window.history.pushState({}, '', url);
    setMeeting(null);
    setSelectedSlots([]);
    setHoveredSlot(null);
    setMeetingId(id);
    setError('');
    setNotice('');
  };

  const handleAuth = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      if (isRegistering) await register(email, password);
      else await signIn(email, password);
    } catch (authError) {
      setError(authError instanceof Error ? authError.message : 'Unable to sign in.');
    } finally {
      setBusy(false);
    }
  };

  const handleCreateMeeting = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user) return;
    setBusy(true);
    setError('');
    try {
      const id = await createMeeting(title, user);
      setTitle('');
      navigateToMeeting(id);
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : 'Unable to create the meeting.');
    } finally {
      setBusy(false);
    }
  };

  const toggleSlot = (slot: string) => {
    setSelectedSlots((current) => current.includes(slot)
      ? current.filter((value) => value !== slot)
      : [...current, slot]);
  };

  const handleSlotPointerDown = (event: PointerEvent<HTMLButtonElement>, slot: string) => {
    event.preventDefault();
    const shouldSelect = !selectedSlots.includes(slot);
    setDrawMode(shouldSelect);
    setSelectedSlots((current) => shouldSelect
      ? current.includes(slot) ? current : [...current, slot]
      : current.filter((value) => value !== slot));
  };

  const handleSlotPointerEnter = (slot: string) => {
    if (drawMode === null) return;
    setSelectedSlots((current) => drawMode
      ? current.includes(slot) ? current : [...current, slot]
      : current.filter((value) => value !== slot));
  };

  const handleUsualSlotPointerDown = (event: PointerEvent<HTMLButtonElement>, slot: string) => {
    event.preventDefault();
    const shouldSelect = !usualSlots.includes(slot);
    setUsualDrawMode(shouldSelect);
    setUsualSlots((current) => shouldSelect
      ? current.includes(slot) ? current : [...current, slot]
      : current.filter((value) => value !== slot));
  };

  const handleUsualSlotPointerEnter = (slot: string) => {
    if (usualDrawMode === null) return;
    setUsualSlots((current) => usualDrawMode
      ? current.includes(slot) ? current : [...current, slot]
      : current.filter((value) => value !== slot));
  };

  const toggleUsualSlot = (slot: string) => {
    setUsualSlots((current) => current.includes(slot)
      ? current.filter((value) => value !== slot)
      : [...current, slot]);
  };

  const handleSaveUsualSchedule = async () => {
    if (!user) return;
    setBusy(true);
    setError('');
    setNotice('');
    try {
      await saveUsualSchedule(user, usualSlots);
      setNotice('Your usual schedule is saved. Existing meeting responses are unchanged; apply and save it separately in each meeting you want to update.');
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Unable to save your usual schedule.');
    } finally {
      setBusy(false);
      setUsualDrawMode(null);
    }
  };

  const handleSaveAvailability = async () => {
    if (!user || !meeting || !name.trim()) {
      setError('Add your name before saving your availability.');
      return;
    }
    setBusy(true);
    setError('');
    setNotice('');
    try {
      await saveAvailability(
        meeting.id,
        { title: meeting.title, createdAt: meeting.createdAt },
        user,
        name.trim(),
        selectedSlots,
      );
      setNotice('Availability saved. Your schedule is ready to reuse next time.');
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Unable to save availability.');
    } finally {
      setBusy(false);
      setDrawMode(null);
    }
  };

  const hoveredSlotParts = hoveredSlot?.split('-').map(Number);
  const hoveredResponses = hoveredSlot && meeting ? Object.values(meeting.responses) : [];
  const hoveredAvailable = hoveredSlot
    ? hoveredResponses.filter((response) => hoveredSlot in response.slots).map((response) => response.name)
    : [];
  const hoveredUnavailable = hoveredSlot
    ? hoveredResponses.filter((response) => !(hoveredSlot in response.slots)).map((response) => response.name)
    : [];

  if (!authReady) {
    return <main className="loading-screen"><span className="brand-mark">w</span><p>Getting your schedule ready…</p></main>;
  }

  if (!user) {
    return (
      <main className="auth-layout">
        <section className="auth-card">
          <a className="brand" href="/" onClick={(event) => { event.preventDefault(); navigateToMeeting(null); }}>
            <span className="brand-mark">w</span> when3meet
          </a>
          <p className="eyebrow">MAKE TIME FOR WHAT MATTERS</p>
          <h1>{isRegistering ? 'Create your account' : 'Find a time together'}</h1>
          <p className="auth-description">
            Sign in to respond to a meeting, see everyone&apos;s availability, and keep your weekly schedule handy.
          </p>
          {error && <p className="message message--error" role="alert">{error}</p>}
          <form className="form-stack" onSubmit={handleAuth}>
            <label htmlFor="email">Email address</label>
            <input id="email" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} />
            <label htmlFor="password">Password</label>
            <input id="password" type="password" autoComplete={isRegistering ? 'new-password' : 'current-password'} minLength={6} required value={password} onChange={(event) => setPassword(event.target.value)} />
            <button className="button button--primary button--wide" disabled={busy} type="submit">
              {busy ? 'Please wait…' : isRegistering ? 'Create account' : 'Sign in'}
            </button>
          </form>
          <button className="text-button auth-switch" onClick={() => { setIsRegistering(!isRegistering); setError(''); }} type="button">
            {isRegistering ? 'Already have an account? Sign in' : 'New here? Create an account'}
          </button>
          {meetingId && <p className="invite-note">Your meeting invite will be waiting after you sign in.</p>}
        </section>
        <aside className="auth-aside">
          <div className="aside-orbit orbit-one" />
          <div className="aside-orbit orbit-two" />
          <div className="aside-copy">
            <span className="eyebrow">BETTER PLANS START HERE</span>
            <h2>Your team&apos;s next<br />“that works for me.”</h2>
            <p>Pick the times that work. We&apos;ll find the overlap.</p>
          </div>
          <div className="mini-week" aria-hidden="true">
            <div className="mini-week__head"><span>YOUR WEEK</span><span>✳</span></div>
            {['MON', 'TUE', 'WED', 'THU', 'FRI'].map((day, index) => (
              <div className="mini-week__row" key={day}><span>{day}</span><i className={`mini-week__slot mini-week__slot--${index}`} /><i /><i className={`mini-week__slot mini-week__slot--${index + 2}`} /><i /></div>
            ))}
            <div className="mini-week__caption">A little overlap goes a long way.</div>
          </div>
        </aside>
      </main>
    );
  }

  return (
    <div className="app-shell" onPointerUp={() => { setDrawMode(null); setUsualDrawMode(null); }} onPointerLeave={() => { setDrawMode(null); setUsualDrawMode(null); }}>
      <header className="topbar">
        <a className="brand" href="/" onClick={(event) => { event.preventDefault(); navigateToMeeting(null); }}>
          <span className="brand-mark">w</span><span>when3meet</span>
        </a>
        <div className="account-bar">
          <span className="account-email">{user.email}</span>
          <button className="text-button" onClick={() => void signOut()} type="button">Sign out</button>
        </div>
      </header>
      <main className="main-content">
        {error && <p className="message message--error" role="alert">{error}</p>}
        {notice && <p className="message message--success" role="status">{notice}</p>}
        {!meetingId ? (
          <>
            <section className="welcome-block">
              <p className="eyebrow">YOUR TEAM, IN SYNC</p>
              <h1>Find a time that<br className="desktop-break" /> works for everyone.</h1>
              <p>Start a weekly availability poll, share the link, and let the overlap find you.</p>
            </section>
            <section className="dashboard-grid">
              <section className="usual-schedule-card">
                <div className="usual-schedule-heading">
                  <div>
                    <span className="eyebrow">SAVED JUST FOR YOU</span>
                    <h2>Your usual week</h2>
                    <p>Select or drag over the hours you’re usually available. You can edit this anytime.</p>
                  </div>
                  <span className="usual-schedule-count">{usualSlots.length} {usualSlots.length === 1 ? 'time' : 'times'} selected</span>
                </div>
                <div className="schedule-wrap">
                  <div className="schedule-grid" role="grid" aria-label="Your usual weekly schedule. Select the hours you are usually available.">
                    <div className="schedule-row schedule-row--head" role="row">
                      <div className="schedule-time-heading" role="columnheader">TIME</div>
                      {days.map((day) => <div className="schedule-day" key={day} role="columnheader">{day.slice(0, 3)}<span>{day.slice(3)}</span></div>)}
                    </div>
                    {hours.map((hour) => (
                      <div className="schedule-row" key={hour} role="row">
                        <div className="schedule-time" role="rowheader">{formatHour(hour)}</div>
                        {days.map((day, dayIndex) => {
                          const slot = `${dayIndex}-${hour}`;
                          const isSelected = usualSlots.includes(slot);
                          return (
                            <button
                              aria-label={`${day}, ${formatHour(hour)}${isSelected ? ', selected in your usual schedule' : ''}`}
                              aria-pressed={isSelected}
                              className={`schedule-cell${isSelected ? ' schedule-cell--selected' : ''}`}
                              key={slot}
                              onPointerDown={(event) => handleUsualSlotPointerDown(event, slot)}
                              onPointerEnter={() => handleUsualSlotPointerEnter(slot)}
                              onClick={(event) => { if (event.detail === 0) toggleUsualSlot(slot); }}
                              role="gridcell"
                              type="button"
                            />
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>
                <p className="usual-schedule-warning" role="note">
                  Updating your usual schedule does not change existing meeting responses. To update a meeting, open it, choose “Use my saved schedule,” then save your availability.
                </p>
                <div className="usual-schedule-actions">
                  <p>Changes to this schedule aren’t saved until you choose Save.</p>
                  <button className="button button--primary" disabled={busy} onClick={() => void handleSaveUsualSchedule()} type="button">
                    {busy ? 'Saving…' : 'Save usual schedule'} <span aria-hidden="true">→</span>
                  </button>
                </div>
              </section>
              <div className="create-card">
                <span className="card-icon" aria-hidden="true">✳</span>
                <h2>Plan something new</h2>
                <p>Choose a name for your weekly team meeting. Your invite link is ready in a moment.</p>
                <form className="create-form" onSubmit={(event) => void handleCreateMeeting(event)}>
                  <label htmlFor="meeting-title">Meeting name</label>
                  <input id="meeting-title" placeholder="e.g. Product team sync" required value={title} onChange={(event) => setTitle(event.target.value)} />
                  <button className="button button--primary" disabled={busy} type="submit">Create a meeting <span aria-hidden="true">→</span></button>
                </form>
              </div>
              <div className="dashboard-side">
                <section className="meetings-card">
                  <div className="section-heading"><div><span className="eyebrow">PICK UP WHERE YOU LEFT OFF</span><h2>Your meetings</h2></div><span className="count-badge">{Object.keys(dashboard.meetings).length}</span></div>
                  {Object.entries(dashboard.meetings).length ? (
                    <div className="meeting-list">
                      {Object.entries(dashboard.meetings).map(([id, savedMeeting]) => (
                        <button className="meeting-row" key={id} onClick={() => navigateToMeeting(id)} type="button">
                          <span className="meeting-row__icon" aria-hidden="true">↗</span>
                          <span className="meeting-row__title">{savedMeeting.title}</span>
                          <span className="meeting-row__arrow" aria-hidden="true">→</span>
                        </button>
                      ))}
                    </div>
                  ) : <p className="empty-state">Your created meetings will show up here.</p>}
                </section>
              </div>
            </section>
          </>
        ) : !meeting ? (
          <section className="empty-meeting">
            <button className="text-button" onClick={() => navigateToMeeting(null)} type="button">← Back to your meetings</button>
            <h1>Finding your meeting…</h1>
            <p>If this invite is no longer available, ask the organizer for a new link.</p>
          </section>
        ) : (
          <section className="meeting-page">
            <button className="text-button back-button" onClick={() => navigateToMeeting(null)} type="button">← Your meetings</button>
            <div className="meeting-heading">
              <div>
                <p className="eyebrow">WEEKLY AVAILABILITY</p>
                <h1>{meeting.title}</h1>
                <p className="meeting-subtitle">Tap or drag across the times that work for you.</p>
              </div>
              <button className="button button--share" onClick={async () => {
                try {
                  await navigator.clipboard.writeText(window.location.href);
                  setNotice('Meeting link copied to clipboard.');
                } catch {
                  setError('Could not copy the link. You can copy it from your browser address bar.');
                }
              }} type="button"><span aria-hidden="true">↗</span> Copy invite link</button>
            </div>
            <div className="meeting-workspace">
              <section className="availability-card">
                <div className="availability-toolbar">
                  <div><h2>When are you free?</h2><p>Times shown in your local timezone</p></div>
                  <span className="timezone-label"><span aria-hidden="true">◷</span> {Intl.DateTimeFormat().resolvedOptions().timeZone}</span>
                </div>
                {dashboard.savedSlots.length > 0 && (
                  <button className="reuse-button" onClick={() => { setSelectedSlots(dashboard.savedSlots); setNotice('Your saved weekly schedule is applied. Save availability to share it.'); }} type="button">
                    <span aria-hidden="true">↻</span> Use my saved schedule
                  </button>
                )}
                <div className="schedule-interaction" onPointerLeave={() => setHoveredSlot(null)}>
                <div className="schedule-wrap">
                  <div className="schedule-grid" role="grid" aria-label="Weekly availability. Select the hours that work for you.">
                    <div className="schedule-row schedule-row--head" role="row">
                      <div className="schedule-time-heading" role="columnheader">TIME</div>
                      {days.map((day) => <div className="schedule-day" key={day} role="columnheader">{day.slice(0, 3)}<span>{day.slice(3)}</span></div>)}
                    </div>
                    {hours.map((hour) => (
                      <div className="schedule-row" key={hour} role="row">
                        <div className="schedule-time" role="rowheader">{formatHour(hour)}</div>
                        {days.map((day, dayIndex) => {
                          const slot = `${dayIndex}-${hour}`;
                          const count = Object.values(meeting.responses).filter((response) => slot in response.slots).length;
                          const isSelected = selectedSlots.includes(slot);
                          const responseCount = Object.keys(meeting.responses).length;
                          const overlapLevel = responseCount > 0 ? Math.ceil((count / responseCount) * 10) : 0;
                          return (
                            <button
                              aria-label={`${day}, ${formatHour(hour)}${isSelected ? ', selected by you' : ''}, ${count} available`}
                              aria-pressed={isSelected}
                              className={`schedule-cell${isSelected ? ' schedule-cell--selected' : ''}${overlapLevel > 0 ? ` schedule-cell--overlap-${overlapLevel}` : ''}`}
                              key={slot}
                              onPointerDown={(event) => handleSlotPointerDown(event, slot)}
                              onPointerEnter={() => {
                                setHoveredSlot(slot);
                                handleSlotPointerEnter(slot);
                              }}
                              onFocus={() => setHoveredSlot(slot)}
                              onClick={(event) => { if (event.detail === 0) toggleSlot(slot); }}
                              role="gridcell"
                              type="button"
                            >
                              <span className="cell-count">{count > 0 ? count : ''}</span>
                            </button>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>
                {hoveredSlot && hoveredSlotParts && (
                  <div className="availability-detail" role="status">
                    <div className="availability-detail-heading">
                      <strong>{days[hoveredSlotParts[0]]}, {formatHour(hoveredSlotParts[1])}</strong>
                      <span>{hoveredAvailable.length} of {hoveredResponses.length} responded available</span>
                    </div>
                    {hoveredResponses.length ? (
                      <div className="availability-detail-groups">
                        <div>
                          <h3>Available ({hoveredAvailable.length})</h3>
                          {hoveredAvailable.length
                            ? <p>{hoveredAvailable.join(', ')}</p>
                            : <p className="availability-detail-empty">No respondents selected this time.</p>}
                        </div>
                        <div>
                          <h3>Not available ({hoveredUnavailable.length})</h3>
                          {hoveredUnavailable.length
                            ? <p>{hoveredUnavailable.join(', ')}</p>
                            : <p className="availability-detail-empty">Everyone who responded is available.</p>}
                        </div>
                      </div>
                    ) : <p className="availability-detail-empty">No one has responded yet.</p>}
                  </div>
                )}
                </div>
                <div className="grid-legend"><span><i className="legend-dot legend-dot--you" />Your selection</span><span><i className="legend-dot legend-dot--group" />Darker green means more people available</span></div>
                <div className="save-row">
                  <label className="name-field" htmlFor="participant-name"><span>Your name</span><input id="participant-name" autoComplete="name" placeholder="How should we call you?" required value={name} onChange={(event) => setName(event.target.value)} /></label>
                  <button className="button button--primary" disabled={busy || selectedSlots.length === 0} onClick={() => void handleSaveAvailability()} type="button">
                    {busy ? 'Saving…' : 'Save my availability'} <span aria-hidden="true">→</span>
                  </button>
                </div>
                <p className="save-hint">Your latest schedule is saved privately to your account for next time.</p>
              </section>
              <aside className="participants-card">
                <span className="eyebrow">THE GROUP</span>
                <h2>Finding the overlap</h2>
                <p className="participant-count">{Object.keys(meeting.responses).length} {Object.keys(meeting.responses).length === 1 ? 'person' : 'people'} responded</p>
                <div className="participant-list">
                  {Object.entries(meeting.responses).map(([uid, response], index) => (
                    <div className="participant" key={uid}><span className={`avatar avatar--${index % 4}`}>{response.name.trim().charAt(0).toUpperCase()}</span><span>{response.name}{uid === user.uid && <small>You</small>}</span><span className="participant-check" aria-label="Responded">✓</span></div>
                  ))}
                  {!Object.keys(meeting.responses).length && <p className="empty-state">You could be the first to share when you&apos;re free.</p>}
                </div>
                <div className="overlap-note"><span aria-hidden="true">✳</span><p>Green cells show a time that works for <strong>everyone who&apos;s responded.</strong></p></div>
              </aside>
            </div>
          </section>
        )}
      </main>
      <footer className="site-footer"><span>when3meet</span><span>Good plans happen when everyone can make it.</span></footer>
    </div>
  );
};

export default App;
