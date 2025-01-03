/*
 * Compile:
 *   javac UF.java
 *   javac JtVerify.java
 *   javac Container.java
 *
 * Run:
 *  java Container
 */


// https://www.w3schools.com/java/default.asp

// Importing utility classes
import java.util.*;

public class Container {
  String name;
  private UF uf;
  private int id;
  private int waterLevel = 0;
  public int waterAddedDirectly = 0;
  private Map<Integer, Container> symbolTable;

  public Container(String inputName, UF inputUf, Map<Integer, Container> inputSymbolTable) {
    name = inputName;
    uf = inputUf;
    id = uf.add();
    symbolTable = inputSymbolTable;
    symbolTable.put(id, this);
  }

  // TBD: make this atomic / thread-safe
  private int calculateWaterLevel() {
    System.out.printf("Calculating water in %s: %doz.%n", name, waterLevel);
    int tmpWaterLevel = 0;

    Set<Integer> cc = uf.cc(id); // use the connected-component
    int numConnectedComponents = cc.size();

    // System.out.println("cc["+id+"]: " + cc + " has " + numConnectedComponents + " connected Components");
    if(cc.isEmpty()) {
      tmpWaterLevel += waterAddedDirectly;
    } else {
      Iterator<Integer> i = cc.iterator();
      while(i.hasNext()) {
        int p = i.next(); // find the object...
        //System.out.printf("Looking for compId: %d%n", p);
        Container uC = symbolTable.get(p);
        if((uC != null) && (uC.id == p)) {
          //System.out.printf("\t*MATCH: uC(%s).id: %d%n", uC.name, uC.id);
          tmpWaterLevel += uC.waterAddedDirectly;
          // } else {
          //System.out.printf("\tNO-MATCH: uC(%s).id: %d%n", uC.name, uC.id);
        }
      } // end-while
      if (numConnectedComponents > 0) {
        tmpWaterLevel /= numConnectedComponents;
      }
    }
    return tmpWaterLevel;
  }

  public void addWater(int amount) { 
    waterAddedDirectly += amount;
    // just update the directlyAddedWater: let getAmount() worry about calculating water from connectedComponents
    System.out.printf("Adding %doz of water to %s for a total of %d.%n", amount, name, getAmount());
  }

  public int getAmount() { 
    //Calculate the waterLevel when it's read: ok for performance (because it relies on QuickFind alg), but bad for programmer
    // must remember to do this for every new lookup method...
    waterLevel = calculateWaterLevel(); //overwrite this object's waterLevel
    return waterLevel; // do we need to update because of a connection ?!
  }

  // new thought: in connectTo and addWater, simply track the directConnections & waterAdditions
  // in getAmount call the function to calculate the value (possibly with caching)

  public void connectTo(Container other) { 
    // opt1b: re-adjust the water-levels NOW ...when connections are made.
    // slower performance: ...and for lookups that may never occur
    // 
    // Better: just update the connections ...let getAmount worry about reading from UF

    uf.union(id, other.id);

    System.out.printf("connecting %s's water to %s's.%n", name, other.name);
  }

  public static void main(String[] args) {
    UF db = new UF();
    Map<Integer, Container> st = new HashMap<>();
    Container a = new Container("a", db, st);
    //System.out.printf("SymbolTable w/ only 'a': " + st + "%n%n");
    Container b = new Container("b", db, st),
              c = new Container("c", db, st),
              d = new Container("d", db, st);
    //System.out.printf("SymbolTable w/ 'a, b, c & d': " + st + "%n%n");

    a.addWater(12);
    JtVerify.verify(a.getAmount() == 12, String.format("a should have 12oz of water, but only has %d", a.getAmount()));

    d.addWater(8);
    JtVerify.verify(d.getAmount() == 8, String.format("d should have 8oz of water, but only has %d", d.getAmount()));

    a.connectTo(b);
    JtVerify.verify(a.getAmount() == 6, String.format("a should have 6oz of water, but only has %d", a.getAmount()));
    JtVerify.verify(a.getAmount() == b.getAmount(), String.format("a's %doz should be equivalent to b's %doz", a.getAmount(), b.getAmount()));

    b.connectTo(c);
    JtVerify.verify(a.getAmount() == 4, String.format("a should have 4oz of water, but only has %d", a.getAmount()));
    JtVerify.verify(a.getAmount() == b.getAmount(), String.format("a's %doz should be equivalent to b's %doz", a.getAmount(), b.getAmount()));
    JtVerify.verify(b.getAmount() == c.getAmount(), String.format("d should have 8oz of water"));

    b.connectTo(d);
    JtVerify.verify(a.getAmount() == 5, String.format("a should have 5oz of water, but only has %d", a.getAmount()));
    JtVerify.verify(a.getAmount() == b.getAmount(), String.format("a's %doz should be equivalent to b's %doz", a.getAmount(), b.getAmount()));
    JtVerify.verify(b.getAmount() == c.getAmount(), String.format("b's %doz should be equivalent to c's %doz", b.getAmount(), c.getAmount()));
    JtVerify.verify(b.getAmount() == d.getAmount(), String.format("b's %doz should be equivalent to d's %doz", b.getAmount(), d.getAmount()));
  }
}
