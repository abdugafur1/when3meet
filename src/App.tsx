import './App.css';

const dateHeaders = ['Oct 4', 'Oct 5', 'Oct 6', 'Oct 7', 'Oct 8', 'Oct 9', 'Oct 10', 'Oct 11'];
const dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const timeLabels = ['12:00 AM', '1:00 AM', '2:00 AM', '3:00 AM', '4:00 AM', '5:00 AM', '6:00 AM', '7:00 AM'];

const availabilityRows: number[][] = [
  [0, 0, 1, 1, 1, 0, 0, 0],
  [0, 1, 1, 1, 1, 0, 0, 0],
  [0, 1, 1, 1, 1, 0, 0, 0],
  [0, 1, 1, 1, 1, 0, 0, 0],
  [0, 1, 1, 1, 1, 0, 0, 0],
  [0, 0, 0, 1, 1, 1, 0, 0],
  [0, 0, 0, 1, 1, 1, 0, 0],
  [0, 0, 0, 0, 1, 1, 0, 0],
];

const lateNightRows: number[][] = [
  [1, 0, 0, 0, 0, 0, 0, 0],
  [1, 0, 0, 0, 0, 0, 0, 0],
];

const App = () => (
  <div className="app-shell">
    <header className="topbar" aria-label="Main navigation">
      <nav className="topbar__nav">
        <a href="#">About When2Meet</a>
        <a href="#">Plan a New Event</a>
      </nav>
    </header>

    <main className="page-content">
      <h1>When3meet</h1>

      <div className="event-intro">
        <span>To invite people to this event, you can</span>
        <a href="#">email them</a>
        <span>, send them a</span>
        <a href="#"> Facebook message</a>
        <span>, or just direct them to</span>
        <a href="#"> https://www.when2meet.com/?379022816-Sx7of</a>
      </div>

      <div className="timezone-row" aria-label="Timezone selector">
        <label htmlFor="timezone">Your Time Zone:</label>
        <select id="timezone" defaultValue="Asia/Tokyo">
          <option value="America/New_York">America/New_York</option>
          <option value="Asia/Tokyo">Asia/Tokyo</option>
          <option value="UTC">UTC</option>
        </select>
      </div>

      <div className="content-grid">
        <section className="panel panel--signin" aria-labelledby="signin-heading">
          <h2 id="signin-heading">Sign In</h2>

          <div className="signin-form">
            <label htmlFor="name">Your Name:</label>
            <input id="name" type="text" />

            <label htmlFor="password">Password (optional):</label>
            <input id="password" type="password" />

            <button type="button">Sign In</button>
          </div>

          <ul className="signin-help">
            <li>Name/Password are only for this event.</li>
            <li>New to this event? Make up a password.</li>
            <li>Returning? Use the same name/password.</li>
          </ul>
        </section>

        <section className="panel panel--availability" aria-labelledby="availability-heading">
          <h2 id="availability-heading">Group&apos;s Availability</h2>

          <div className="legend" aria-label="Availability legend">
            <span className="legend-item">
              <span className="legend-swatch legend-swatch--empty" />0/1 Available
            </span>
            <span className="legend-item">
              <span className="legend-swatch legend-swatch--full" />1/1 Available
            </span>
          </div>

          <p className="legend-note">Mouseover the Calendar to See Who Is Available</p>

          <div className="schedule-grid" aria-label="Availability calendar">
            <div className="schedule-grid__header">
              <div className="schedule-grid__corner" />
              {dateHeaders.map((date) => (
                <div key={date} className="schedule-grid__date">
                  {date}
                </div>
              ))}
            </div>

            <div className="schedule-grid__header schedule-grid__header--secondary">
              <div className="schedule-grid__corner" />
              {dayHeaders.map((day, index) => (
                <div key={`${day}-${index}`} className="schedule-grid__day">
                  {day}
                </div>
              ))}
            </div>

            {timeLabels.map((time, rowIndex) => (
              <div key={time} className="schedule-grid__row">
                <div className="schedule-grid__time">{time}</div>
                {availabilityRows[rowIndex]?.map((value, cellIndex) => (
                  <div
                    key={`${time}-${cellIndex}`}
                    className={`schedule-grid__cell schedule-grid__cell--${
                      value === 1 ? 'available' : value === 0 ? 'unavailable' : 'empty'
                    }`}
                  />
                ))}
              </div>
            ))}
          </div>

          <div className="late-night-grid" aria-label="Late night availability">
            {lateNightRows.map((row, rowIndex) => (
              <div key={`late-${rowIndex}`} className="late-night-grid__row">
                {row.map((value, cellIndex) => (
                  <div
                    key={`late-${rowIndex}-${cellIndex}`}
                    className={`late-night-grid__cell late-night-grid__cell--${
                      value === 1 ? 'available' : value === 0 ? 'unavailable' : 'empty'
                    }`}
                  />
                ))}
              </div>
            ))}
            <div className="late-night-grid__time">11:00 PM</div>
            <div className="late-night-grid__time late-night-grid__time--second">12:00 AM</div>
          </div>
        </section>
      </div>
    </main>
  </div>
);

export default App;