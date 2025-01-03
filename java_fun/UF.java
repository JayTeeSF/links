/*
 * javac UF.java
 * java UF
 */

// Importing utility classes
import java.util.*;

/* Class for implementing an efficient Dynamic connectivity algorithm
 * i.e. QuickFind (not (yet) Quick Union)
 * an integer array indexed by object
 * objects p & q are connected if their entry in the arry has the same value
 * Essentially Union-Find from Algorithms with Robert Sedgewick and Kevin Wayne
 * algs4.cs.princeton.edu
 */
public class UF {
  public static void main(String[] args) {
    System.out.println("create an instance of UF(<no args required>)");
    UF uf = new UF();
    int id0 = uf.add();
    System.out.printf("%nCall #add and store it's (int) return-value as your object's id: %d%n", id0);

    int id1 = uf.add();
    int id2 = uf.add();
    int id3 = uf.add();
    int id4 = uf.add();
    System.out.printf("%nRepeat that a few more times: %d, %d, %d, %d%n", id1, id2, id3, id4);
    Set<Integer> cc0 = uf.cc(id0);
    Set<Integer> cc1 = uf.cc(id1);
   
    List<Integer> list0 = Arrays.asList(0);
    Set<Integer> expectedCc0 = new HashSet<Integer>(list0);

    List<Integer> list1 = Arrays.asList(1);
    Set<Integer> expectedCc1 = new HashSet<Integer>(list1);

    System.out.printf("%nNotice 0 & 1 have disconnected (isolated) component(s)...%n%n");

    JtVerify.verify(cc0.equals(expectedCc0), "Expected cc0 to be " + expectedCc0 + ", got: " + cc0);
    JtVerify.verify(cc1.equals(expectedCc1), "Expected cc1 to be " + expectedCc1 + ", got: " + cc1);

    System.out.printf("%n%nUnion 0 & 1...");
    uf.union(id0, id1);
    cc0 = uf.cc(id0);
    cc1 = uf.cc(id1);
    System.out.printf("%nNotice 0 & 1 share a connected component...%n%n");
    List<Integer> list01 = Arrays.asList(0,1);
    Set<Integer> expectedCc0and1 = new HashSet<Integer>(list01);

    JtVerify.verify(cc0.equals(expectedCc0and1), "Expected cc0 to be " + expectedCc0and1 + ", got: " + cc0);
    JtVerify.verify(cc1.equals(expectedCc0and1), "Expected cc1 to be " + expectedCc0and1 + ", got: " + cc1);

    System.out.printf("%n%nUnion 4 & 1 and 4 and 3...");
    uf.union(id4, id1);
    uf.union(id4, id3);
    Set<Integer> cc3 = uf.cc(id3);
    Set<Integer> cc4 = uf.cc(id4);
    System.out.printf("%nNotice 0,1,3 and 4 all share a connected component...%n%n");
    cc0 = uf.cc(id0);
    cc1 = uf.cc(id1);
    cc3 = uf.cc(id3);
    cc4 = uf.cc(id4);
    List<Integer> list013and4 = Arrays.asList(0,1,3,4);
    Set<Integer> expectedCc013and4 = new HashSet<Integer>(list013and4);

    JtVerify.verify(cc0.equals(expectedCc013and4), "Expected cc0 to be " + expectedCc013and4 + ", got: " + cc0);
    JtVerify.verify(cc1.equals(expectedCc013and4), "Expected cc1 to be " + expectedCc013and4 + ", got: " + cc1);
    JtVerify.verify(cc3.equals(expectedCc013and4), "Expected cc3 to be " + expectedCc013and4 + ", got: " + cc3);
    JtVerify.verify(cc4.equals(expectedCc013and4), "Expected cc4 to be " + expectedCc013and4 + ", got: " + cc4);
  }

  ArrayList<Integer> array;
  public UF() {
    // tbd: add a symbol table: id => object mapping...
    array = new ArrayList<Integer>(); //(size);
  }

  // default every value in the array to a negative number!
  public int add() {
    array.add(array.size()); // use it's value to keep it separate from all others
    return array.size() - 1; // this index
  }

  // return the unique list of id(s) in this connectedComponent
  public Set<Integer> cc(int p) {
    Set<Integer> retVal = new HashSet<Integer>();
    int ccId = find(p);

    // TBD: stuff all entries from array with value == ccId, into retVal
    for (int i = 0; i < array.size(); i++) {
      if (array.get(i) == ccId) {
        retVal.add(i);
      }
    }

    return retVal;
  }

  public int find(int p) {
    return array.get(p); // the "name/id" of the connectedComponent
  }

  public void union(int p, int q) {
    int pVal = find(p);
    int qVal = find(q);
    // set all of p's and q's elements to p's value
    Set<Integer> ccomp = cc(q);
    Iterator<Integer> i = ccomp.iterator();
    while(i.hasNext()) {
      int l = i.next();
      int ignore = array.set(l, pVal);
    }
  }
}
