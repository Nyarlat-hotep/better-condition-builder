export const FIELDS = [
  {
    name: 'StarType',
    valueType: 'predefined',
    options: ['Neutron', 'Pulsar', 'Red Giant', 'White Dwarf', 'Black Hole'],
    operators: ['==', '!='],
  },
  {
    name: 'Galaxy',
    valueType: 'predefined',
    options: ['Milky Way', 'Andromeda', 'Triangulum', 'Sombrero'],
    operators: ['==', '!='],
  },
  {
    name: 'Constellation',
    valueType: 'predefined',
    options: ['Orion', 'Cassiopeia', 'Lyra', 'Cygnus', 'Perseus'],
    operators: ['==', '!='],
  },
  {
    name: 'Mass',
    valueType: 'number',
    operators: ['==', '!=', '>', '<', '>=', '<='],
  },
  {
    name: 'Distance',
    valueType: 'number',
    operators: ['==', '!=', '>', '<', '>=', '<='],
  },
  {
    name: 'Temperature',
    valueType: 'number',
    operators: ['==', '!=', '>', '<', '>=', '<='],
  },
  {
    name: 'Age',
    valueType: 'number',
    operators: ['==', '!=', '>', '<', '>=', '<='],
  },
]

export const FIELD_MAP = Object.fromEntries(FIELDS.map(f => [f.name, f]))
