--[[
  dh-fastest-code-content
]]

-- defines the ctypes
require "types.lua"
local ffi = require "ffi"
local utils = require "utils.lua"
local collections = require "collections.lua"

local exports = {}

local internals = {
    tree = nil,
    points = nil,
    points_len = nil,
    results = {},
}

function exports.init(filename)

    assert(filename ~= nil)
    
    local n = 0
    for line in io.lines(filename) do
        n = n + 1
    end

    local p = ffi.C.malloc(ffi.sizeof('Point') * n)
    p = ffi.cast('Point *', p)
    
    local i = 0
    for line in io.lines(filename) do
        local pdata = utils.split(line)
        p[i].x = tonumber(pdata[1])
        p[i].y = tonumber(pdata[2])
        p[i].rank = tonumber(pdata[3])
        i = i + 1
    end

    -- create a copy for the tree
    local t = ffi.C.malloc(ffi.sizeof('Point') * n);
    t = ffi.cast('Point *', t)

    -- copy the values
    ffi.copy(t, p, ffi.sizeof('Point') * n)

    -- build the tree
    internals.tree = collections.Kdtree:new(t, 0, n)

    local function cmp(x, y)
        return x[0].rank - y[0].rank
    end

    local cb = ffi.cast('int (*)(Point *, Point *)', cmp)

    ffi.C.qsort(p, n, ffi.sizeof('Point'), cb)

    internals.points = p
    internals.points_len = n
end


function exports.run(rects)
    for i = 1, #rects do 
        local r = rects[i]
        local result = collections.MagicHeap:new(20)
        local skip_tree = false
        for i = 1, 4096 do
            local p = internals.points[i]
            if r.lx <= p.x and p.x < r.hx and r.ly <= p.y and p.y < r.hy then
                result:insert(p.rank)
            end
            if result:top() then
                table.insert(internals.results, result:sort())
                skip_tree = true
                break
            end
        end
        if not skip_tree then
            collections.Kdtree:find(internals.tree, r, result)
            table.insert(internals.results, result:sort())
        end
    end
end

function exports.results()
    local result = ""
    for i = 1, #internals.results do
        local line = internals.results[i]
        for k, v in ipairs(line) do
            result = result  .. tonumber(v) .. " "
        end
        result = result .. "\n"
    end
    return result
end

return exports
