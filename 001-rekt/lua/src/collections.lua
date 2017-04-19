
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
axis_map[0] = 'x'
axis_map[1] = 'y'
axis_map[2] = 'rank'

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

    local insert = native.MagicHeap_insert
    local heaptop = native.MagicHeap_top

    depth = depth or 0
    local axis = axis_map[depth % 3]

    local p = tree.point
    local r = rect

    if r.lx <= p.x and p.x < r.hx and r.ly <= p.y and p.y < r.hy then
        insert(heap, p.rank)
    end

    if axis ~= 'rank' then
        local max = 'h'..axis
        local min = 'l'..axis
       
        if rect[min] <= p[axis] then
            find(tree.left, rect, heap, depth +1)
        end

        if rect[max] > p[axis] then
            find(tree.right, rect, heap, depth +1)
        end
    else
        find(tree.left, rect, heap, depth +1)
        local top = heaptop(heap)
        if (not top) or p.rank <= top then
            find(tree.right, rect, heap, depth +1)
        end
    end


end

function Node:find(rect, points)
    local h = native.MagicHeap_new(points)
    find(self, rect, h)
    return native.MagicHeap_sort(h)
end

local Kdtree = {}
Kdtree.__index = Kdtree
exports.Kdtree = Kdtree
function Kdtree:new(points, depth)

    depth = depth or 0

    local len = #points

    if len == 0 then
        return nil
    end

    local median = math.ceil(len/2)

    local axis = axis_map[depth % 3]

    table.sort(points, function(x, y) return x[axis] < y[axis] end)


    local slice = utils.slice
    local left_subtree = slice(points, 1, median-1)
    local right_subtree = slice(points, median+1)

    return Node:new(
        points[median],
        Kdtree:new(left_subtree, depth + 1),
        Kdtree:new(right_subtree, depth + 1)
    )
end

return exports
