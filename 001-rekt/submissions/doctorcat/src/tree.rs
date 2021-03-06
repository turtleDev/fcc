// range tree WIP
// Static, only bulk insertion supported.
use rpoint::RPoint;
use std::cmp::Ordering;
use std::f32;


// A slab is bounded only in the x-directions.
#[derive(Debug, Clone, PartialEq, PartialOrd)]
pub struct Slab{
    x1: f32,
    x2: f32,
}

// A bucket is unbounded in the positive-y direction.
#[derive(Debug, Clone, PartialEq, PartialOrd)]
pub struct Bucket{
    x1: f32,
    x2: f32,
    y1: f32,
    active: bool,
    // y-sorted points in the bucket
    y_points: Vec<RPoint>,
}

#[derive(Debug, Copy, Clone, PartialEq, PartialOrd)]
// Stores an index to a bucket vector and the interval
// in which the bucket was active.
pub struct BucketRef{
    min_active: f32,
    max_active: f32,
    x1: f32,
    x2: f32,
    idx: usize,
}

impl Eq for BucketRef {}

impl Ord for BucketRef{
    fn cmp(&self, other: &BucketRef) -> Ordering{
        self.partial_cmp(other).unwrap()
    }
}


#[derive(Debug, Clone)]
// A VEB search tree
pub struct VTree<T: PartialOrd> {
    summary: Option<Vec<T>>,
    clusters: Option<Vec<VTree<T>>>,
    min: T,
    max: Option<T>,
    size: usize,
    chunk_size: usize,
}

// A Tree data structure for 3-sided range queries
#[derive(Debug, Clone)]
pub struct SecondaryTree {
    slabs: Vec<Slab>,
    bucketrefs: Vec<BucketRef>,
    intervals: Vec<VTree<BucketRef>>,
    buckets: Vec<Bucket>,
    clusters: Option<Vec<SecondaryTree>>,
    size: usize,
    chunk_size: usize,
}

impl SecondaryTree where {
    pub fn new() -> SecondaryTree{
        SecondaryTree {
            slabs: Vec::new(),
            bucketrefs: Vec::new(),
            intervals: Vec::new(),
            buckets: Vec::new(),
            clusters: None,
            size: 0,
            chunk_size:0
        }
    }

    pub fn bulk_insert(&mut self, points: &mut Vec<RPoint>){
        // println!("{:?}", points);
        let p_len = points.len();
        if p_len < 1 {
            panic!("Should have at least one point.")
        }

        let mut chunk_size = chunk_size(p_len);
        if p_len == 2 {
            chunk_size -= 1;
        }

        // Create initial slabs and buckets.
        // They represent/contain ~sqrt(n) points each.
        // Points get sorted by x.
        let (slab_vec, mut bucket_vec, mut bucketref_vec) = chunk_points(
            points, chunk_size);
        // Sweep upwards to create new buckets.
        // We have ~2 * sqrt(n) - 1 buckets after this.
        sweep(points, &mut bucket_vec, &mut bucketref_vec, chunk_size);

        // Find buckets spanning slab and insert in buckettree.
        let mut intervals = Vec::with_capacity(chunk_size);
        for s in &slab_vec{
            let mut slab_buckets = Vec::with_capacity(chunk_size);
            let mut idx = 0;
            for b in &bucket_vec {
                if b.x1 <= s.x1 && b.x2 >= s.x2 {
                    slab_buckets.push(bucketref_vec[idx]);
                }
                idx += 1;
            }
            let buckettree = VTree::new(&slab_buckets);
            intervals.push(buckettree);
        }
        // println!("Buckets: {:?}", bucket_vec);
        if p_len < 30 {
            self.slabs = slab_vec;
            self.bucketrefs = bucketref_vec;
            self.intervals = intervals;
            self.buckets = bucket_vec;
            self.clusters = None;
            self.size = p_len;
            self.chunk_size = p_len;
            return;
        }

        // Recursively define rest of secondary trees
        let mut children = Vec::with_capacity(2*chunk_size);
        for bucket in &bucket_vec {
            let mut bpoints = bucket.y_points.clone();
            let mut child = SecondaryTree::new();
            child.bulk_insert(&mut bpoints);
            children.push(child);
        }

        // Join together results to return secondary tree
        self.slabs = slab_vec;
        self.bucketrefs = bucketref_vec;
        self.intervals = intervals;
        self.clusters = Some(children);
        self.buckets = bucket_vec;
        self.size = p_len;
        self.chunk_size = chunk_size;
    }

    pub fn search(&self, x1: f32, x2: f32, y1: f32) -> Vec<RPoint>{
        let relevant = &self.bucketrefs.iter()
            .filter(|p| p.x1 >= x1 && p.x2 <= x2
                    && y1 >= p.min_active && y1 <= p.max_active)
            .collect::<Vec<&BucketRef>>();
        let mut points = Vec::with_capacity(20000);
        for r in relevant{
            let ref buckets = self.buckets;
            points.extend(&buckets[r.idx].y_points);
        }
        // Incomplete. Recurse into leftmost and rightmost buckets
        return points;
    }
}

fn chunk_points(points: &mut Vec<RPoint>, chunk_size: usize)
                   -> (Vec<Slab>, Vec<Bucket>, Vec<BucketRef>) {
    if chunk_size > points.len() {
        panic!("Can't use chunk size larger than vector size");
    }
    if points.len() == 0 {
        return (Vec::new(), Vec::new(), Vec::new());
    }

    points.sort_by(|a, b|
                   a.x.partial_cmp(&b.x).unwrap());
    let mut slab_vec = Vec::with_capacity(chunk_size);
    let mut bucket_vec = Vec::with_capacity(2 * chunk_size);
    let mut bucketref_vec = Vec::with_capacity(2 * chunk_size);

    for (idx, chunk) in points.chunks(chunk_size).enumerate(){
        let xlow = chunk.first().unwrap().x;
        let xhigh = chunk.last().unwrap().x;
        slab_vec.push(Slab {x1: xlow, x2: xhigh});
        let bucket = Bucket::new(xlow, xhigh, true, &chunk.to_vec());
        let bucketref = BucketRef {
            min_active: bucket.y1,
            max_active: f32::MAX,
            x1: xlow,
            x2: xhigh,
            idx: idx,
        };
        bucket_vec.push(bucket);
        bucketref_vec.push(bucketref);
    }

    return (slab_vec, bucket_vec, bucketref_vec);
}

fn sweep(points: &mut Vec<RPoint>, mut bucket_vec: &mut Vec<Bucket>,
         mut bucketref_vec: &mut Vec<BucketRef>, chunk_size: usize){
    let active_buckets = ((0..bucket_vec.len()).collect::<Vec<usize>>()).to_vec();
    points.sort_by((|a, b|
                    a.y.partial_cmp(&b.y).unwrap()));
    let mut act = active_buckets.clone();
    let iter_chunks = if points.len() >= 10000 {chunk_size} else {1};
    for chunk in points.chunks(iter_chunks) {
        let p = chunk[0];
        let y_coord = p.y;
        if act.len() == 1 {break;}
        act = sweep_step(y_coord,
                         act.clone(),
                         &mut bucket_vec,
                         &mut bucketref_vec,
                         chunk_size);
    }
}

fn sweep_step(y_coord: f32, active_buckets: Vec<usize>, mut bucket_vec: &mut Vec<Bucket>,
              mut bref_vec: &mut Vec<BucketRef>, chunk_size: usize) -> Vec<usize> {
    let mut act = active_buckets.clone();
    let len = active_buckets.len();
    if len == 0 {
        return Vec::new();
    }
    // Indexing original active_bucket list
    let mut ai = 0;
    let mut aj = ai + 1;

    // Indexing the copy of the list
    let mut ac_i = ai;
    let mut ac_j = aj;
    while ai < len - 1 {
        // Indexing total bucket list;
        let bi_idx = active_buckets[ai];
        let bj_idx = active_buckets[aj];

        let filt = |b: &Bucket | {
            b.y_points.iter().filter(|p| p.y > y_coord).count()
        };
        let i_count = filt(&bucket_vec[bi_idx]);
        let j_count = filt(&bucket_vec[bj_idx]);

        if i_count + j_count < chunk_size {
            bucket_vec[bi_idx].active = false;
            bucket_vec[bj_idx].active = false;
            bref_vec[bi_idx].max_active = y_coord;
            bref_vec[bj_idx].max_active = y_coord;
            let mut ypoints = bucket_vec[bi_idx]
                .y_points
                .iter()
                .cloned()
                .filter(|p| p.y >= y_coord)
                .collect::<Vec<RPoint>>();

            ypoints.extend(bucket_vec[bj_idx]
                           .y_points
                           .iter()
                           .cloned()
                           .filter(|p| p.y >= y_coord)
                           .collect::<Vec<RPoint>>());
            ypoints.sort_by(|a, b| a.y.partial_cmp(&b.y).unwrap());
            let x1 = bucket_vec[bi_idx].x1;
            let x2 = bucket_vec[bj_idx].x2;
            let bucket = Bucket::new_active(x1, x2, y_coord, &ypoints);
            bucket_vec.push(bucket);
            let idx = bucket_vec.len() - 1;
            let bucketref = BucketRef {
                min_active: y_coord,
                max_active: f32::MAX,
                x1: x1,
                x2: x2,
                idx: idx,
            };
            bref_vec.push(bucketref);
            act[ac_i] = idx;
            act.remove(ac_j);

            ai += 2;
            aj += 2;
            continue;
        }
        ai += 1;
        aj += 1;
        ac_i += 1;
        ac_j += 1;
    }
    return act;
}

fn chunk_size(len: usize) -> usize {
    (len as f32).sqrt().ceil() as usize
}

impl Bucket {
    fn new(x1: f32, x2: f32, activity: bool,
           points: &Vec<RPoint>) -> Bucket {
        let mut y_points = points.clone();
        y_points.sort_by(|a, b| a.y.partial_cmp(&b.y).unwrap());
        let y1 = y_points.first().unwrap().y;
        Bucket {
            x1: x1,
            x2: x2,
            y1: y1,
            active: activity,
            y_points: y_points,
        }
    }

    fn new_active(x1: f32, x2: f32, y1: f32,
                     points: &Vec<RPoint>) -> Bucket {
        let mut y_points = points.clone();
        y_points.sort_by(|a, b| a.y.partial_cmp(&b.y).unwrap());
        Bucket {
            x1: x1,
            x2: x2,
            y1: y1,
            active: true,
            y_points: y_points,
        }
    }
}

impl<T: PartialOrd + Clone> VTree<T>{
    // Take in a sorted vector
    fn new(xs: &[T]) -> Self {
        let len = xs.len();
        let chunk_size = chunk_size(len);
        match len {
            0 => panic!("At least one element must be inserted."),
            1 =>  {
                let mint = xs.first().unwrap().clone();
                return VTree {
                    min: mint,
                    max: None,
                    summary: None,
                    clusters: None,
                    size: 1,
                    chunk_size: chunk_size,
                };
            },
            2 => {
                let mint = xs.first().unwrap().clone();
                let maxt = xs.last().unwrap().clone();
                VTree {
                    min: mint,
                    max: Some(maxt),
                    summary: None,
                    clusters: None,
                    size: 2,
                    chunk_size: chunk_size,
                }
            },
            n => {
                let mint = xs.first().unwrap().clone();
                let maxt = xs.last().unwrap().clone();
                let mut cluster = Vec::with_capacity(chunk_size);
                let mut sum_vec = Vec::with_capacity(chunk_size);
                for chunk in xs[1..len-1].chunks(chunk_size) {
                    let min = chunk.first().unwrap().clone();
                    let subtree = VTree::new(chunk);
                    sum_vec.push(min);
                    cluster.push(subtree);
                }
                VTree {
                    min: mint,
                    max: Some(maxt),
                    summary: Some(sum_vec),
                    clusters: Some(cluster),
                    size: n,
                    chunk_size: chunk_size,
                }
            }
        }
    }

    fn lookup_lower<F>(&self, x: f32, mut f: F) -> Option<&T>
        where F: FnMut(&T) -> f32
    {
        let minkey = f(&self.min);
        if x < minkey {
            return None;
        }

        match self.size {
            1 => Some(&self.min),
            2 => {
                let m = self.max.as_ref().unwrap();
                let maxkey = f(m);
                if x >= maxkey { Some(m) } else { Some(&self.min) }
            },
            _ => {
                let m = self.max.as_ref().unwrap();
                let maxkey = f(m);
                if x >= maxkey {Some(m)} else {
                    let clusters = self.clusters.as_ref().unwrap();
                    // kind of missing the point
                    let sumres = self.summary.as_ref().unwrap().binary_search_by(
                        |p| f(p).partial_cmp(&x).unwrap());
                    match sumres {
                        Ok(n) => clusters[n].lookup_lower(x, f),
                        Err(0) => Some(&self.min),
                        Err(n) => clusters[n - 1].lookup_lower(x, f),
                    }
                }
            }
        }
    }
}

#[cfg(test)]
mod tests {
    extern crate test;
    use super::*;
    use rpoint::RPoint;
    use rand::Rng;
    use std::f32;
    use std::__rand::thread_rng;
    use std::time::SystemTime;
    use test::Bencher;

    quickcheck! {
        // Around sqrt(n) slabs and buckets should get created initially
        fn prop_initial_population(xs: Vec<RPoint>) -> bool{
            let chunk_size = chunk_size(xs.len());
            let mut ps = xs.clone();
            let (svec, bvec, bref_vec) = chunk_points(&mut ps, chunk_size);
            bvec.len() <= chunk_size
                && bref_vec.len() == bvec.len()
                && svec.len() <= chunk_size
        }

        // Inserted point must lie in one of the initial slabs or buckets
        fn prop_point_in_slab_or_bucket(xs: Vec<RPoint>, x: RPoint) -> bool {
            let mut ps = xs.clone();
            let p = x.clone();
            ps.push(x);

            let chunk_size = chunk_size(ps.len());
            let (svec, bvec, _) = chunk_points(&mut ps, chunk_size);

            let s_count = svec.iter()
                .filter(|s| p.x >= s.x1 && p.x <= s.x2)
                .count();

            let p_count = bvec.iter()
                .filter(|b| {
                    p.x >= b.x1
                        && p.x <= b.x2
                        && p.y >= b.y1
                })
                .count();
            s_count == 1 && p_count == 1
        }

        // Size of active buckets vector should decrease by 0 or 1 per step.
        fn prop_sweep_step_size_decrease(xs: Vec<RPoint>) -> bool {
            let chunk_size = chunk_size(xs.len());
            let mut ps = xs.clone();
            let (_ , mut bvec, mut bref_vec) = chunk_points(&mut ps, chunk_size);
            let active_buckets = (0..bvec.len())
                .collect::<Vec<usize>>()
                .to_vec();
            let new_actives = sweep_step(0.0, active_buckets.clone(),
                                         &mut bvec, &mut bref_vec,
                                         chunk_size);
            (active_buckets.len() == new_actives.len()
             || active_buckets.len() == new_actives.len() + 1)
                && bvec.len() == bref_vec.len()
        }

        // Size of buckets after sweep should be around ~2*sqrt(n)
        fn prop_len_bucket_vector(xs: Vec<RPoint>) -> bool {
            let len = xs.len();
            let chunk_size = chunk_size(len);
            let mut ps = xs.clone();
            let (_, mut bvec, mut bref_vec) = chunk_points(&mut ps,
                                                              chunk_size);
            println!("Points:{} Initial Buckets: {} Chunksize {}",
                     len, bvec.len(), chunk_size);
            sweep(&mut ps, &mut bvec, &mut bref_vec, chunk_size);
            println!("Buckets: {} {:?}", bvec.len(), bvec);
            // Investigate what this invariant should actually be
            if len > 0 {
                bvec.len() <= (2 * chunk_size - 1)
            }
            else { true }
        }

        // Buckets should have at least one point
        fn prop_bucket_size(xs: Vec<RPoint>) -> bool {
            let len = xs.len();
            if len == 0 {return true;}
            let chunk_size = chunk_size(len);
            let mut ps = xs.clone();
            let (_, mut bvec, mut bref_vec) = chunk_points(&mut ps,
                                                           chunk_size);
            println!("Points:{} Initial Buckets: {} Chunksize {}",
                     len, bvec.len(), chunk_size);
            sweep(&mut ps, &mut bvec, &mut bref_vec, chunk_size);
            println!("Buckets: {} {:?}", bvec.len(), bvec);
            // Investigate what this invariant should actually be
            let mut res = true;
            for b in bvec {
                println!("{:?}", b);
                res = res && b.y_points.len() >= 1;
            }
            res
        }

        // just check for crashes
        fn vtree_create(xs: Vec<f32>) -> bool {
            if xs.len() == 0 { return true; }
            let mut ps = xs.clone();
            ps.sort_by(|a, b| a.partial_cmp(&b).unwrap());
            println!("{:?}", ps);
            let tree = VTree::new(&ps);
            println!("{:?}", tree);
            return true;
        }

        // just check for crashes
        fn secondary_tree_create(xs: Vec<RPoint>) -> bool {
            if xs.len() <= 2 { return true; }
            let mut ps = xs.clone();
            println!("");
            let mut tree = SecondaryTree::new();
            tree.bulk_insert(&mut ps[0..2].to_vec());
            println!("{:?}", tree);
            return true;
        }

        fn prop_chunk_size(x: usize) -> bool {
            chunk_size(x) >= ((x as f32).sqrt() as usize)
        }

        // Element in tree should be found.
        fn vtree_lookup_lower(xs: Vec<f32>) -> bool {
            if xs.len() == 0 { return true; }
            let mut ps = xs.clone();
            let elem = thread_rng().choose(&xs).unwrap();
            ps.sort_by(|a, b| a.partial_cmp(&b).unwrap());
            println!("Searching for {} in {:?}", elem, ps);
            let tree = VTree::new(&ps);
            println!("{:?}", tree);
            let now = SystemTime::now();
            let res = tree.lookup_lower(*elem + f32::MIN_POSITIVE, |x| *x);
            println!("Time taken for lookup for {} elements: {}", xs.len(),
                     now.elapsed().unwrap().subsec_nanos());
            println!("{:?}", res);
            elem.eq(res.unwrap())
        }
    }

    #[bench]
    fn vtree_lookup_bench(b: &mut Bencher) {
        let ref mut rng = thread_rng();
        let mut vec = Vec::with_capacity(1024);
        for _ in 0..1000000{
            vec.push(rng.next_f32());
        }
        vec.sort_by(|a, b| a.partial_cmp(&b).unwrap());
        let tree = VTree::new(&vec);
        let elem = rng.choose(&vec).unwrap();
        b.iter(|| tree.lookup_lower(*elem, |x| *x));
    }
}
