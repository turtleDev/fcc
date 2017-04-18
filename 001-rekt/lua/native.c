#include <lua.h>
#include <lauxlib.h>
#include <stdlib.h>
#include <stdio.h>
#include <stdint.h>
#include <stdbool.h>

static void sift_up(int64_t *vec, int i, int n)
{
    int p = (i -1)/2;
    int64_t tmp;
    while ( i > 0 && vec[i] > vec[p] ) {
        tmp = vec[i];
        vec[i] = vec[p];
        vec[p] = tmp;
        i = p;
        p = (i -1)/2;
    }
}

static void sift_down(int64_t *vec, int i, int n)
{
    int c1 = ((i+1) * 2) -1;
    int c2 = c1 + 1;
    int s;

    while ( c1 < n ) {

        if ( c2 == n ) s = c1;
        else if ( vec[c1] > vec[c2] ) s = c1;
        else s = c2;

        if ( vec[i] > vec[s] ) break;

        int64_t tmp;
        tmp = vec[i];
        vec[i] = vec[s];
        vec[s] = tmp;

        i = s;
        c1 = ((i+1) * 2) -1;
        c2 = c1 + 1;
    }
}

/**
 * A max heap
 */
struct MagicHeap {
    size_t max;
    size_t len;
    int64_t data[1];
};

/**
 * one extra member for keeping the last member
 */
int MagicHeap_new(lua_State *L)
{
    size_t capacity = luaL_checkint(L, 1);
    size_t cap = sizeof(struct MagicHeap) + capacity * sizeof(int64_t);
    struct MagicHeap *obj = lua_newuserdata(L, cap);
    obj->max = capacity;
    obj->len = 0;
    return 1;
}

static void MagicHeap_insert(struct MagicHeap *self, int64_t data)
{
    self->data[self->len] = data;
    sift_up(self->data, self->len, self->max);
    self->len += 1;
    
    if ( self->len == self->max ) {
        self->len -= 1;
        self->data[0] = self->data[self->len];
        sift_down(self->data, 0, self->max);
    }
}

static bool MagicHeap_top(struct MagicHeap *self, int64_t *top)
{
    if ( (self->max - self->len) == 1 ) {
        *top = self->data[0];
    }
}

static void MagicHeap_sort(struct MagicHeap *self)
{
    size_t i = self->len;
    int64_t tmp;
    int64_t *data = self->data;
    while ( i > 0 ) {
        tmp = data[i];
        data[i] = data[0];
        data[0] = tmp;
        --i;
        sift_down(data, 0, i);
    }
}

static void pe(int64_t *v, int n) {
    int i;
    for ( i = 0; i < n; ++i ) {
        printf("%ld ", v[i]);
    }
    printf("\n");
}

void native_open_MagicHeap(lua_State *L)
{ 
    luaL_Reg mp[] = {
        { "MagicHeap", MagicHeap_new },
        { NULL, NULL }
    };
    
    luaL_register(L, "native", mp);
}
