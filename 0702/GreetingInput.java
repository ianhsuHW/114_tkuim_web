import java.util.Scanner;

public class GreetingInput {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);

        System.out.print("請輸入姓名：");
        String N = sc.nextLine();

        System.out.print("請輸入年齡：");
        int A = sc.nextInt();

        System.out.println("Hello, " + N + ". You are " + A + " years old.");

        sc.close();
    }
}
