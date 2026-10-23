// The next dated race controls the exit theme; past races never do.
export function exitMode(races, today) {
  const next = races.filter(r => /^\d{4}-\d{2}-\d{2}$/.test(r.date || '') && r.date >= today)
    .slice().sort((a, b) => a.date.localeCompare(b.date))[0];
  return next?.format === 'Backyard' ? 'backyard' : 'standard';
}
export function exitPrompt(mode) {
  return {
    type: 'question',
    title: mode === 'backyard' ? 'Answer the bell?' : 'Intentional DNF?',
    message: mode === 'backyard' ? 'The chair has accepted you. The bell has not.' : 'Calling it at this aid station?',
    detail: mode === 'backyard'
      ? 'There’s still time to question your life choices before the next yard. Save any open form before settling into that chair. Your saved workouts stay on this laptop.'
      : 'Ultrarunners don’t quit. They DNF intentionally. Save any open form before heading for the snacks. Your saved workouts stay on this laptop.',
    buttons: mode === 'backyard' ? ['Answer the bell', 'The chair wins'] : ['One more loop', 'DNF intentionally — exit'],
    defaultId: 0, cancelId: 0
  };
}
