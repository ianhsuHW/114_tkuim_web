import java.util.Scanner;

public class HealthCalculator {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);

        System.out.print("請輸入姓名：");
        String N = sc.nextLine();

        System.out.print("請輸入年齡：");
        int A = sc.nextInt();

        System.out.print("請輸入身高（公尺）：");
        double H = sc.nextDouble();

        System.out.print("請輸入體重（公斤）：");
        double W = sc.nextDouble();

        double B = W / (H * H);

        System.out.println();
        System.out.println("=== 個人健康資料 ===");
        System.out.println("姓名：" + N);
        System.out.println("年齡：" + A);
        System.out.println("身高：" + H);
        System.out.println("體重：" + W);
        System.out.println("BMI：" + B);

        sc.close();
    }
}
