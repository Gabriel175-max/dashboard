export const palette = {
  amber: '#D4A84B',
  amberSoft: '#E2B966',
  moss: '#7A9960',
  mossSoft: '#A8C08B',
  bone: '#ECE5D3',
  boneMuted: '#8A8573',
  ink: '#0B0C09',
  grid: 'rgba(236, 229, 211, 0.08)',
  axis: '#978D76'
};

// A warm editorial palette for categorical series (ordered from most to least prominent)
export const series = [
  '#D4A84B', // amber
  '#7A9960', // moss
  '#E2B966', // amber soft
  '#A8C08B', // moss soft
  '#BDB39A', // bone-300
  '#8A6B25', // amber-700
  '#465E36'  // moss-700
];

export const gradientStops = {
  amber: [
    { o: 0, c: 'rgba(212, 168, 75, 0.45)' },
    { o: 1, c: 'rgba(212, 168, 75, 0)' }
  ],
  moss: [
    { o: 0, c: 'rgba(122, 153, 96, 0.45)' },
    { o: 1, c: 'rgba(122, 153, 96, 0)' }
  ]
};
