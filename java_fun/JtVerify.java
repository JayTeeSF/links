import java.util.*;

/*
 * javac JtVerify.java
 * java JtVerify
 */
public class JtVerify {
  public static boolean verify(boolean expr) {
    return verify(expr, "");
  }

  public static boolean verify(boolean expr, String message) {
    if (expr == true) {
      System.out.println("true");
      return true;
    } else {
      if (message == null || message.isEmpty()) {
        System.out.println("false");
      } else {
        System.out.printf("false: %s%n", message);
      }
      return false;
    }
  }

  public static void main(String[] args) {
    System.out.println("Confirm if true == true");
    verify(true == true, "expected true to equal true");

    System.out.println("\nConfirm if false == false");
    verify(false == false, "expected false to equal false");

    System.out.println("\nConfirm if true != false");
    verify(true != false, "expected true NOT to equal false");

    System.out.println("\nConfirm if false != true");
    verify(false != true, "expected false NOT to equal true");

    // expected failures:
    System.out.println("\nFail checking if true == false");
    verify(true == false, "expected true to (incorrectly) equal false");

    System.out.println("\nFail checking if false == true");
    verify(false == true, "expected false to (incorrectly) equal true");

    //object comparison test(s):
    List<Integer> list1 = Arrays.asList(0,1,3,5);
    Set<Integer> obj1 = new HashSet<Integer>(list1);
    List<Integer> list2 = Arrays.asList(1,3,5,0);
    Set<Integer> obj2 = new HashSet<Integer>(list2);

    System.out.println("\nConfirm obj1.equals(obj2)*");
    verify(obj1.equals(obj2), "expected obj1 " + obj1 + " to equal obj2: " + obj2);
    System.out.println("\nNote: obj1 == obj2 is not proper syntax");
  }
}
