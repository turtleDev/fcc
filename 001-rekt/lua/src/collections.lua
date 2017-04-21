
local ffi = require "ffi"
local utils = require "utils.lua"

local exports = {}

local MagicHeap = {}
MagicHeap.__index = MagicHeap
exports.MagicHeap = MagicHeap

function default_cmp(x, y)
    return x > y
end

function MagicHeap:new(cap, cmp)

    local obj = { 
        cap = cap,
        items = {}, 
        len = 0,
        cmp = cmp or default_cmp
    }
    return setmetatable(obj, self)
end

function MagicHeap:top()
    if #self.items == self.cap then
        return self.items[1]
    end
    return nil
end

function MagicHeap:_sift()

    local items = self.items
    local cmp = self.cmp
    local len = self.len

    local p = 1
    local c1 = p * 2
    local c2 = c1 + 1

    while c1 <= len do

        local n

        if c2 > len then
            n = c1
        elseif cmp(items[c1], items[c2]) then
            n = c1
        else
            n = c2
        end

        if cmp(items[p], items[n]) then
            break
        end

        items[p], items[n] = items[n], items[p]
        p = n
        c1 = p * 2
        c2 = c1 + 1
    end
end

function MagicHeap:insert(item)

    local items = self.items
    self.len = self.len + 1
    items[self.len] = item

    local i = self.len
    local p = math.floor(i/2)
    local cmp = self.cmp
    
    -- let it sift up
    while i > 1 and not cmp(items[p], items[i]) do
        items[i], items[p] = items[p], items[i]
        i = p
        p = math.floor(i/2)
    end

    if self.len > self.cap then
        items[1] = items[self.len]
        items[self.len] = nil
        self.len = self.len -1
        self:_sift()
    end
end

function MagicHeap:sort()

    local items = self.items

    while self.len > 1 do
        items[self.len], items[1] = items[1], items[self.len]
        self.len = self.len -1
        self:_sift()
    end

    return items
end


local axis_map = {}
axis_map[0] = 'y'
axis_map[1] = 'rank'
axis_map[2] = 'x'

local axis_cmp = {}
axis_cmp[0] = function(a, b) return a.y < b.y and -1 or 1 end
axis_cmp[1] = function(a, b) return a.rank - b.rank end
axis_cmp[2] = function(a, b) return a.x < b.x and -1 or 1 end

for i = 0, 2 do
    axis_cmp[i] = ffi.cast('int (*)(Point *, Point *)', axis_cmp[i])
end

local Node = {}
Node.__index = Node

function Node:new(point, left, right)
    local obj = {
        point = point,
        left = left,
        right = right
    }
    return setmetatable(obj, self)
end

function find(tree, rect, heap, depth)
    if tree == nil then
        return
    end

    depth = depth or 0
    local axis = axis_map[depth % 3]

    local p = tree[0].point
    local r = rect

    if r.lx <= p.x and p.x < r.hx and r.ly <= p.y and p.y < r.hy then
        heap:insert(p.rank)
    end

    if axis ~= 'rank' then
        local max = 'h'..axis
        local min = 'l'..axis
       
        if rect[min] <= p[axis] then
            find(tree[0].left, rect, heap, depth +1)
        end

        if rect[max] > p[axis] then
            find(tree[0].right, rect, heap, depth +1)
        end
    else
        find(tree[0].left, rect, heap, depth +1)
        local top = heap:top()
        if (not top) or p.rank <= top then
            find(tree[0].right, rect, heap, depth +1)
        end
    end
end


local Kdtree = {}
Kdtree.__index = Kdtree
exports.Kdtree = Kdtree
--[[ start is inclusive, fin is exclusive ]]
function Kdtree:new(points, start, fin, depth)

    depth = depth or 0

    local len = fin - start

    if len <= 0 then
        return nil
    end

    local median = start + math.floor(len/2)

    local axis = axis_map[depth % 3]
    local cmp = axis_cmp[depth % 3]

    local base = points[start]
    ffi.C.qsort(base, len, ffi.sizeof('Point'), cmp)

    local node = ffi.C.malloc(ffi.sizeof('Node'))

    node = ffi.cast('Node *', node)
    node[0].point = points[median]
    node[0].left = Kdtree:new(points, start, median, depth + 1)
    node[0].right = Kdtree:new(points, median+1, fin, depth + 1)

    return node
end

function Kdtree:find(tree, rect, points)
    local h = MagicHeap:new(points)
    find(tree, rect, h)
    return h:sort()
end

return exports
