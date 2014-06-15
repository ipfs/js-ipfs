// object mapping both { num : name } and { name : num }
var types = module.exports = {}

add(0, 'block')
add(1, 'list')
add(2, 'tree')
add(3, 'commit')

function add(num, name) {
  types[num] = name
  types[name] = num
}