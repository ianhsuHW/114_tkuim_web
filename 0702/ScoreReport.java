import java.util.Scanner;

public class ScoreReport {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);

        // 讀取使用者姓名與三科成績
        System.out.print("請輸入姓名：");
        String N = sc.nextLine();

        System.out.print("請輸入 Java 成績：");
        int JS = sc.nextInt();

        System.out.print("請輸入 English 成績：");
        int ES = sc.nextInt();

        System.out.print("請輸入 Math 成績：");
        int MS = sc.nextInt();

        // 計算三科成績平均，除以 3.0 以取得 double 型態的小數結果
        double A = (JS + ES + MS) / 3.0;

        // 輸出成績報表結果
        System.out.println();
        System.out.println("=== 成績報表 ===");
        System.out.println("姓名：" + N);
        System.out.println("Java：" + JS);
        System.out.println("English：" + ES);
        System.out.println("Math：" + MS);
        System.out.println("平均：" + A);

        sc.close();
    }
}
