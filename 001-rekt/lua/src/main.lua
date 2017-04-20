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

    local threshold = 10000
    local abs = math.abs
    local function size(rect)
        return abs(rect.hy - rect.ly) * abs(rect.hx - rect.lx)
    end

    local table_insert = table.insert
    local points = internals.points
    local results = internals.results
    local tree = internals.tree

    for i = 1, #rects do 
        local r = rects[i]
        if size(r) > threshold then
            local result = {}
            for i = 1, internals.points_len do
                local p = points[i]
                if r.lx <= p.x and p.x < r.hx and r.ly <= p.y and p.y < r.hy then
                    table_insert(result, p.rank)
                    if #result == 20 then
                        break
                    end
                end
            end
            table_insert(results, result)
        else
            local result = collections.Kdtree:find(tree, r, 20)
            table_insert(results, result)
        end
    end
end

function exports.results()
    local result = ""
    for i = 1, #internals.results do
        local line = internals.results[i]
        for k, v in ipairs(line) do
            result = result  .. tostring(v) .. " "
        end
        result = result .. "\n"
    end
    return result
end

return exports
