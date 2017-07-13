--[[
  dh-fast-code-content v2
  002-palt
]]

function load_palette(file)
  -- todo
  return {}
end
function main(argv)
  local source_file = argv[1]
  local palette_file = argv[2]
  assert(
    source and palette,
    string.format('usage: %s image-file palette-file', argv[0])
  )

  local palette = load_palette(palette_file)
end

os.exit(main(arg))
