import java.util.Properties;    

/*
 * What's the purpose of a comment?
 * this is a block-style comment
 */

public class WhoAreYou
{
    // this is a single-line comment
    public static Properties extractName(String[] name) {
        Properties props = new Properties();
        String fullName;
        String firstName = "Someone";
        String lastName = "Unknown";
        String middleName = "";
        
        if (name.length > 1) {
         if (name.length < 2) {
            firstName = name[0];
          } else if (name.length < 3) {
            firstName = name[0];
            lastName = name[1];
          } else if (name.length < 4) {
            firstName = name[0];
            middleName = name[1];
            lastName = name[2];
          }
        }

        props.setProperty("firstName", toTitleCase(firstName)); // (key, value)
        props.setProperty("lastName", toTitleCase(lastName)); // (key, value)
        props.setProperty("middleName", toTitleCase(middleName)); // (key, value)
        // System.out.println("middleName = " + props.getProperty("middleName"));
        props.setProperty("fullName", props.getProperty("firstName") + " " + props.getProperty("middleName") + " " + props.getProperty("lastName")); // (key, value)

		return props;
    }
  
    public static String toTitleCase(String word) {
      if (word == null || word.isEmpty()) {
        // System.out.println("null for " + word);
        return "";
      } 
      
      int word_length = word.length();
      int spaceless_word_length = word.replace(" ", "").length();
      if ((word_length - spaceless_word_length) > 1) {
        // System.out.println("n/a for " + word);
        return word; // not prepared to handle this...
      }
      
      // System.out.println("1 for " + word);
      return word.substring(0,1).toUpperCase() + word.substring(1); //.toLowerCase();
    }
    
    public static void main(String[] args) {
        Properties nameInfo = extractName(args);
        System.out.println("Hi you must be " + nameInfo.getProperty("fullName"));
    }
}