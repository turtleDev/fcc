--[[
  dh-fastest-code-content
]]

local utils = require "utils.lua"
local collections = require "collections.lua"

local exports = {}

local internals = {
    tree = nil,
    points = nil,
    results = {},
}

function exports.init(filename)

    assert(filename ~= nil)

    local p = {}
    for line in io.lines(filename) do
        local pdata = utils.split(line)
        local point = {
            x = tonumber(pdata[1]),
            y = tonumber(pdata[2]),
            rank = tonumber(pdata[3]),
        }

        table.insert(p, point)
    end

    internals.tree = collections.Kdtree:new(p)

    table.sort(p, function(x, y) return x.rank < y.rank end)
    internals.points = p
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
    local MagicHeap = collections.MagicHeap

    for i = 1, #rects do 
        local r = rects[i]
        if size(r) > threshold then
            local result = {}
            for i = 1, #points do
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
            local result = tree:find(r, 20)
            table_insert(results, result)
        end
    end
end

function exports.results()
    local result = ""
    for i = 1, #internals.results do
        local line = internals.results[i]
        for k, v in ipairs(line) do
            result = result  .. v .. " "
        end
        result = result .. "\n"
    end
    return result
end

return exports
